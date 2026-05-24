import { useCallback, useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured, isStorageConfigured } from '../firebase/config';
import { getUserId } from '../lib/userId';
import { canSaveDay } from '../lib/speechTrainingProgress';
import { uploadDayRecording, deleteDayRecording } from '../lib/speechTrainingFirebase';
import { normalizeDayMap, supersedePendingSubmission } from '../lib/speechTrainingAssessments';
import { ensureFirebaseAuth } from '../firebase/auth';

const LOCAL_KEY = 'speech-training-completed';
const LOCAL_RECORDINGS_KEY = 'speech-training-recordings';
const FIRESTORE_PATH = 'projects/speech-training/progress';

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadLocalRecordings() {
  try {
    const raw = localStorage.getItem(LOCAL_RECORDINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocal(completed) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(completed));
}

function saveLocalRecordings(recordings) {
  localStorage.setItem(LOCAL_RECORDINGS_KEY, JSON.stringify(recordings));
}

function progressRef() {
  const userId = getUserId();
  return doc(db, FIRESTORE_PATH, userId);
}

export function useSpeechTrainingProgress() {
  const [completed, setCompleted] = useState(loadLocal);
  const [recordings, setRecordings] = useState(loadLocalRecordings);
  const [assessments, setAssessments] = useState({});
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [uploadingDay, setUploadingDay] = useState(null);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLoading(false);
      return undefined;
    }

    let unsubscribe = () => {};

    ensureFirebaseAuth()
      .then(() => {
        const ref = progressRef();

        unsubscribe = onSnapshot(
          ref,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const remoteCompleted = normalizeDayMap(data.completed);
              const remoteRecordings = normalizeDayMap(data.recordings);
              const remoteAssessments = normalizeDayMap(data.assessments);
              setCompleted(remoteCompleted);
              setRecordings(remoteRecordings);
              setAssessments(remoteAssessments);
              saveLocal(remoteCompleted);
              saveLocalRecordings(remoteRecordings);
            }
            setLoading(false);
            setSyncError(null);
          },
          (error) => {
            console.error('Firestore sync error:', error);
            setSyncError(error.message);
            setLoading(false);
          }
        );

        getDoc(ref).then((snapshot) => {
          if (!snapshot.exists()) {
            const localCompleted = loadLocal();
            const localRecordings = loadLocalRecordings();
            if (
              Object.keys(localCompleted).length > 0 ||
              Object.keys(localRecordings).length > 0
            ) {
              setDoc(
                ref,
                {
                  completed: localCompleted,
                  recordings: localRecordings,
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              );
            }
          }
        });
      })
      .catch((error) => {
        console.error('Firebase auth error:', error);
        setSyncError(error.message);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const saveRecording = useCallback(async (dayNum, blob, durationMs) => {
    if (!isStorageConfigured) {
      throw new Error(
        'Recording requires Firebase Storage. Enable Storage in the Firebase console and set REACT_APP_FIREBASE_STORAGE_BUCKET.'
      );
    }

    if (!canSaveDay(dayNum, completed, Boolean(recordings[dayNum]))) {
      throw new Error(`Complete Day ${dayNum - 1} before saving Day ${dayNum}.`);
    }

    setUploadingDay(dayNum);
    setSyncError(null);

    try {
      const previous = recordings[dayNum];
      if (previous?.storagePath) {
        await deleteDayRecording(previous.storagePath);
      }

      const fileMeta = await uploadDayRecording(dayNum, blob);
      const recording = {
        ...fileMeta,
        recordedAt: new Date().toISOString(),
        durationMs,
      };

      setRecordings((prev) => {
        const next = { ...prev, [dayNum]: recording };
        saveLocalRecordings(next);
        return next;
      });
      setCompleted((prev) => {
        const next = { ...prev };
        delete next[dayNum];
        saveLocal(next);
        return next;
      });
      setAssessments((prev) => ({
        ...prev,
        [dayNum]: {
          ...(prev[dayNum] || {}),
          requiresRedo: false,
          status: 'awaiting_share',
          pendingSubmissionId: null,
        },
      }));

      if (isFirebaseConfigured && db) {
        const ref = progressRef();
        const snap = await getDoc(ref);
        const currentCompleted = snap.exists()
          ? normalizeDayMap(snap.data().completed)
          : {};
        const currentRecordings = snap.exists()
          ? normalizeDayMap(snap.data().recordings)
          : {};
        const currentAssessments = snap.exists()
          ? normalizeDayMap(snap.data().assessments)
          : {};

        delete currentCompleted[dayNum];

        const oldPendingId = currentAssessments[dayNum]?.pendingSubmissionId;
        if (oldPendingId) {
          await supersedePendingSubmission(oldPendingId);
        }

        currentAssessments[dayNum] = {
          requiresRedo: false,
          status: 'awaiting_share',
          pendingSubmissionId: null,
        };

        await setDoc(
          ref,
          {
            completed: currentCompleted,
            recordings: { ...currentRecordings, [dayNum]: recording },
            assessments: currentAssessments,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        setAssessments(currentAssessments);
      }

      return recording;
    } catch (error) {
      console.error('Failed to save recording:', error);
      setSyncError(error.message);
      throw error;
    } finally {
      setUploadingDay(null);
    }
  }, [completed, recordings]);

  const clearDayProgress = useCallback(async (dayNum) => {
    const daysToClear = [];
    for (let d = dayNum; d <= 21; d += 1) {
      if (completed[d] || recordings[d]) daysToClear.push(d);
    }

    const filesToDelete = daysToClear
      .map((d) => recordings[d]?.storagePath)
      .filter(Boolean);

    setCompleted((prev) => {
      const next = { ...prev };
      daysToClear.forEach((d) => delete next[d]);
      saveLocal(next);
      return next;
    });
    setRecordings((prev) => {
      const next = { ...prev };
      daysToClear.forEach((d) => delete next[d]);
      saveLocalRecordings(next);
      return next;
    });

    await Promise.all(filesToDelete.map((path) => deleteDayRecording(path).catch(console.error)));

    if (isFirebaseConfigured && db) {
      const ref = progressRef();
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const nextCompleted = normalizeDayMap(snap.data().completed);
        const nextRecordings = normalizeDayMap(snap.data().recordings);
        const nextAssessments = normalizeDayMap(snap.data().assessments);
        daysToClear.forEach((d) => {
          delete nextCompleted[d];
          delete nextRecordings[d];
          delete nextAssessments[d];
        });
        await setDoc(
          ref,
          {
            completed: nextCompleted,
            recordings: nextRecordings,
            assessments: nextAssessments,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        setAssessments(nextAssessments);
      }
    }
  }, [completed, recordings]);

  const toggleComplete = useCallback(
    async (dayNum) => {
      const isDone = completed[dayNum];
      if (isDone) {
        await clearDayProgress(dayNum);
      } else {
        setCompleted((prev) => {
          const next = { ...prev, [dayNum]: true };
          saveLocal(next);
          return next;
        });

        if (isFirebaseConfigured && db) {
          const ref = progressRef();
          await updateDoc(ref, {
            [`completed.${dayNum}`]: true,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    },
    [completed, clearDayProgress]
  );

  return {
    completed,
    recordings,
    assessments,
    toggleComplete,
    saveRecording,
    clearDayProgress,
    uploadingDay,
    loading,
    syncError,
    isSynced: isFirebaseConfigured,
    canRecord: isStorageConfigured,
  };
}
