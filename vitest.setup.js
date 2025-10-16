// silence ReactDOMTestUtils.act deprecation warnings emitted by some test utilities
const filterMessage = (args) => {
  try {
    const first = args[0];
    const message = typeof first === 'string' ? first : (first && first.message) || '';
    return typeof message === 'string' && message.includes('ReactDOMTestUtils.act is deprecated');
  } catch (e) {
    return false;
  }
};

const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  if (filterMessage(args)) return;
  return originalError.apply(console, args);
};

console.warn = (...args) => {
  if (filterMessage(args)) return;
  return originalWarn.apply(console, args);
};
