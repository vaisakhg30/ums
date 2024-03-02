const Joi = require('@hapi/joi');

module.exports = Joi.object({
  password: Joi.string()
    .min(8)
    .required(),
});