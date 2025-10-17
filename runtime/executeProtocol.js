function executeProtocol(logic) {
  const fn = new Function('require', 'module', logic);
  const module = { exports: {} };
  fn(require, module);
  return module.exports;
}

module.exports = executeProtocol;
