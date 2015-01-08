var Joi = require('joi');

var schema = Joi.object()
  .keys({
    precinct: Joi.number().integer().min(1),
    results: Joi.array().min(1).includes(
      // Race or proposition object.
      Joi.object().keys({
        race: Joi.string().min(3),
        results: Joi.array().min(1).includes(
          Joi.object()
            .keys({
              // Candidate name, "yes", or "no".
              option: Joi.string().min(3),
              // The number of votes in favor.
              votes: Joi.number().integer().min(0)
            })
            .requiredKeys('option', 'votes')
        )
      })
      .requiredKeys('race', 'results')
    )
  })
  .requiredKeys('precinct', 'results');

module.exports = function(input) {
  return Joi.validate(input, schema).error === null;
};
