var Joi = require('joi');

var schema = Joi.object()
  .keys({
    precinct: Joi.number().integer().min(1),
    elections: Joi.array().min(1).includes(
      // Race or proposition.
      Joi.object().keys({
        name: Joi.string().min(1),
        // e.g. "Governor", "Proposition 43"
        tallies: Joi.array().min(1).includes(
          Joi.object()
            .keys({
              // Candidate name, "yes", or "no".
              option: Joi.string().min(1),
              // The number of votes in favor.
              votes: Joi.number().integer().min(0)
            })
            .requiredKeys('option', 'votes')
        )
      })
      .requiredKeys('name', 'tallies')
    )
  })
  .requiredKeys('precinct', 'elections');

module.exports = function(input) {
  return Joi.validate(input, schema).error === null;
};
