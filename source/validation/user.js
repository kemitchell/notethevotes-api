var Joi = require('joi');

var schema = Joi.object().keys({
  first: Joi.string().min(3),
  last: Joi.string().min(3),
  email: Joi.string().email(),
  password: Joi.string().min(5)
}).requiredKeys('first', 'last', 'email', 'password');

module.exports = function(input) {
  return Joi.validate(input, schema).error === null;
};
