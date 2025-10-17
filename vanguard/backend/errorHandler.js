// Central error handler middleware for Express
function errorHandler(err, req, res, _next) {
  console.error(err.stack);
  res.status(500).send({ error: 'Internal Server Error' });
}

module.exports = { errorHandler };
