import { useCallback, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import {
  db,
  isFirebaseConfigured,
  isStorageConfigured,
} from "../firebase/config";
import { getUserId } from "../lib/userId";
import {
  canSaveDay,
  formatDateKey,
  getProgramStartDateFromUser,
  getSaveDayError,
} from "../lib/speechTrainingProgress";
import { useProgramClock } from "./useProgramClock";
import { DEFAULT_THEME_ID, getThemeById } from "../config/themePalette";
import {
  uploadDayRecording,
  deleteDayRecording,
} from "../lib/speechTrainingFirebase";
import {
  ensureUserShareCode,
  normalizeDayMap,
  publishRecordingLink,
  supersedePendingSubmission,
} from "../lib/speechTrainingAssessments";
import {
  DEFAULT_PROGRAM_DAYS,
  findDayInProgram,
  normalizeProgramDuration,
} from "../lib/speechTrainingProgram";
import { getSpeaklyUser } from "../lib/speaklyUsers";

const LOCAL_KEY = "speech-training-completed";
const LOCAL_RECORDINGS_KEY = "speech-training-recordings";
const LOCAL_PROGRAM_START_KEY = "speech-training-program-start";
const LOCAL_PROGRAM_DURATION_KEY = "speech-training-program-duration";
const LOCAL_THEME_KEY = "speech-training-theme";
const FIRESTORE_PATH = "projects/speech-training/progress";

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
  const { user, loading: authLoading } = useAuth();
  const now = useProgramClock();
  const [completed, setCompleted] = useState(loadLocal);
  const [recordings, setRecordings] = useState(loadLocalRecordings);
  const [assessments, setAssessments] = useState({});
  const [shareCode, setShareCode] = useState(null);
  const [themeId, setThemeId] = useState(() => {
    try {
      return localStorage.getItem(LOCAL_THEME_KEY) || DEFAULT_THEME_ID;
    } catch {
      return DEFAULT_THEME_ID;
    }
  });
  const [programStartDate, setProgramStartDate] = useState(() => {
    try {
      return localStorage.getItem(LOCAL_PROGRAM_START_KEY);
    } catch {
      return null;
    }
  });
  const [programDuration, setProgramDuration] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_PROGRAM_DURATION_KEY);
      return raw ? normalizeProgramDuration(Number(raw)) : DEFAULT_PROGRAM_DAYS;
    } catch {
      return DEFAULT_PROGRAM_DAYS;
    }
  });
  const [loading, setLoading] = useState(true);
  const [uploadingDay, setUploadingDay] = useState(null);
  const [syncError, setSyncError] = useState(null);

  const effectiveProgramStart =
    programStartDate ||
    (user ? getProgramStartDateFromUser(user) : formatDateKey(now));

  useEffect(() => {
    const theme = getThemeById(themeId);
    document.documentElement.style.setProperty("--brand", theme.brand);
    document.documentElement.style.setProperty("--brand-hover", theme.hover);
    document.documentElement.style.setProperty("--brand-ink", theme.ink);
    try {
      localStorage.setItem(LOCAL_THEME_KEY, theme.id);
    } catch {
      // ignore
    }
  }, [themeId]);

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    if (!user || !isFirebaseConfigured || !db) {
      setLoading(false);
      return undefined;
    }

    let unsubscribe = () => {};
    const ref = progressRef();

    unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const remoteCompleted = normalizeDayMap(data.completed);
          const remoteRecordings = normalizeDayMap(data.recordings);
          const remoteAssessments = normalizeDayMap(data.assessments);
          if (data.shareCode) {
            setShareCode(data.shareCode);
          }
          if (data.themeColor) {
            setThemeId(data.themeColor);
            try {
              localStorage.setItem(LOCAL_THEME_KEY, data.themeColor);
            } catch {
              // ignore
            }
          }
          if (data.programStartDate) {
            setProgramStartDate(data.programStartDate);
            localStorage.setItem(
              LOCAL_PROGRAM_START_KEY,
              data.programStartDate,
            );
          }
          if (data.programDuration) {
            const duration = normalizeProgramDuration(data.programDuration);
            setProgramDuration(duration);
            localStorage.setItem(LOCAL_PROGRAM_DURATION_KEY, String(duration));
          }
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
        console.error("Firestore sync error:", error);
        setSyncError(error.message);
        setLoading(false);
      },
    );

    getDoc(ref).then(async (snapshot) => {
      const startDate = getProgramStartDateFromUser(user);
      const initialTheme = themeId || DEFAULT_THEME_ID;
      const speaklyProfile = await getSpeaklyUser(user.uid);
      const duration = normalizeProgramDuration(
        snapshot.exists() && snapshot.data().programDuration
          ? snapshot.data().programDuration
          : speaklyProfile?.programDuration,
      );
      setProgramDuration(duration);
      localStorage.setItem(LOCAL_PROGRAM_DURATION_KEY, String(duration));

      if (!snapshot.exists()) {
        setProgramStartDate(startDate);
        localStorage.setItem(LOCAL_PROGRAM_START_KEY, startDate);

        const localCompleted = loadLocal();
        const localRecordings = loadLocalRecordings();
        await setDoc(
          ref,
          {
            email: user.email || null,
            programStartDate: startDate,
            programDuration: duration,
            themeColor: initialTheme,
            completed: localCompleted,
            recordings: localRecordings,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
        return;
      }

      const patch = {};
      if (!snapshot.data().programStartDate) {
        setProgramStartDate(startDate);
        localStorage.setItem(LOCAL_PROGRAM_START_KEY, startDate);
        patch.programStartDate = startDate;
      }
      if (!snapshot.data().programDuration) {
        patch.programDuration = duration;
      }
      if (Object.keys(patch).length > 0) {
        await setDoc(
          ref,
          {
            ...patch,
            themeColor: snapshot.data().themeColor || initialTheme,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
      }
    });

    return () => unsubscribe();
  }, [user, authLoading, themeId]);

  const saveRecording = useCallback(
    async (dayNum, blob, durationMs) => {
      if (!isStorageConfigured) {
        throw new Error(
          "Recording requires Firebase Storage. Enable Storage in the Firebase console and set REACT_APP_FIREBASE_STORAGE_BUCKET.",
        );
      }

      if (
        !canSaveDay(
          dayNum,
          completed,
          assessments,
          Boolean(recordings[dayNum]),
          effectiveProgramStart,
          now,
          programDuration,
        )
      ) {
        throw new Error(
          getSaveDayError(
            dayNum,
            completed,
            assessments,
            Boolean(recordings[dayNum]),
            effectiveProgramStart,
            now,
            programDuration,
          ),
        );
      }

      setUploadingDay(dayNum);
      setSyncError(null);

      try {
        const previous = recordings[dayNum];
        if (previous?.storagePath) {
          await deleteDayRecording(previous.storagePath);
        }

        const fileMeta = await uploadDayRecording(dayNum, blob);
        const dayMatch = findDayInProgram(dayNum, programDuration);
        const recording = {
          ...fileMeta,
          recordedAt: new Date().toISOString(),
          durationMs,
        };

        let nextRecordingNum = (assessments[dayNum]?.lastRecordingNum || 0) + 1;
        let nextShareCode = shareCode;
        let playbackUrl = null;

        if (isFirebaseConfigured && db) {
          const userId = getUserId();
          nextShareCode = await ensureUserShareCode(userId);
          setShareCode(nextShareCode);

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

          nextRecordingNum = (currentAssessments[dayNum]?.lastRecordingNum || 0) + 1;

          delete currentCompleted[dayNum];

          const oldPendingId = currentAssessments[dayNum]?.pendingSubmissionId;
          if (oldPendingId) {
            await supersedePendingSubmission(oldPendingId);
          }

          if (dayMatch?.day) {
            playbackUrl = await publishRecordingLink({
              userId,
              dayNum,
              day: dayMatch.day,
              recording,
              recordingNum: nextRecordingNum,
              shareCode: nextShareCode,
            });
          }

          recording.playbackUrl = playbackUrl;
          recording.recordingNum = nextRecordingNum;

          currentAssessments[dayNum] = {
            ...(currentAssessments[dayNum] || {}),
            requiresRedo: false,
            status: "awaiting_share",
            pendingSubmissionId: null,
            lastRecordingNum: nextRecordingNum,
            playbackUrl,
          };

          await setDoc(
            ref,
            {
              completed: currentCompleted,
              recordings: { ...currentRecordings, [dayNum]: recording },
              assessments: currentAssessments,
              shareCode: nextShareCode,
              updatedAt: new Date().toISOString(),
            },
            { merge: true },
          );

          setAssessments(currentAssessments);
        } else {
          setAssessments((prev) => ({
            ...prev,
            [dayNum]: {
              ...(prev[dayNum] || {}),
              requiresRedo: false,
              status: "awaiting_share",
              pendingSubmissionId: null,
              lastRecordingNum: nextRecordingNum,
            },
          }));
        }

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

        return recording;
      } catch (error) {
        console.error("Failed to save recording:", error);
        setSyncError(error.message);
        throw error;
      } finally {
        setUploadingDay(null);
      }
    },
    [
      completed,
      recordings,
      assessments,
      shareCode,
      effectiveProgramStart,
      now,
      programDuration,
    ],
  );

  const clearDayProgress = useCallback(
    async (dayNum) => {
      const daysToClear = [];
      const duration = normalizeProgramDuration(programDuration);
      for (let d = dayNum; d <= duration; d += 1) {
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

      await Promise.all(
        filesToDelete.map((path) =>
          deleteDayRecording(path).catch(console.error),
        ),
      );

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
            { merge: true },
          );
          setAssessments(nextAssessments);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completed, recordings, assessments, effectiveProgramStart, now, programDuration],
  );

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
    [completed, clearDayProgress],
  );

  const setThemeColor = useCallback(
    async (nextThemeId) => {
      setThemeId(nextThemeId);
      if (isFirebaseConfigured && db) {
        const ref = progressRef();
        await setDoc(
          ref,
          { themeColor: nextThemeId, updatedAt: new Date().toISOString() },
          { merge: true },
        );
      }
    },
    [setThemeId],
  );

  return {
    completed,
    recordings,
    assessments,
    shareCode,
    themeId,
    setThemeColor,
    programStartDate: effectiveProgramStart,
    programDuration,
    now,
    toggleComplete,
    saveRecording,
    clearDayProgress,
    uploadingDay,
    loading: loading || authLoading,
    syncError,
    isSynced: isFirebaseConfigured && Boolean(user),
    canRecord: isStorageConfigured,
  };
}
