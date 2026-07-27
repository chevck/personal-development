// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom lacks IntersectionObserver (used by useRevealOnScroll) and scrollTo.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

global.IntersectionObserver = MockIntersectionObserver;
window.scrollTo = () => {};

// jsdom doesn't implement object URLs (used for local file previews).
if (!global.URL.createObjectURL) {
  global.URL.createObjectURL = () => 'blob:mock-url';
}
if (!global.URL.revokeObjectURL) {
  global.URL.revokeObjectURL = () => {};
}
