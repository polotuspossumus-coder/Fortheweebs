const Joi = require('joi');

const schema = Joi.object({
  filename: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).max(10),
});

module.exports = function validateUpload(req, res, next) {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};
