/* jshint mocha: true */
require('chai').should();

describe('validation', function() {
  describe('of reports', function() {
    var validator = require('../source/validation/report.js');
    it('validates valid reports', function() {
      validator({
        precinct: 7619,
        elections: [
          {
            name: 'Governor',
            tallies: [
              { option: 'LUIS J. RODRIGUEZ', votes: 11 },
              { option: 'ALMA MARIE WINSTON', votes: 0 },
              { option: 'EDMUND G. "JERRY" BROWN', votes: 48 },
              { option: 'JANEL HYESHIA BUYCKS', votes: 1 },
              { option: 'ANDREW BLOUNT', votes: 0 },
              { option: 'RAKESH KUMAR CHRISTIAN', votes: 0 },
              { option: 'GLENN CHAMP', votes: 0 },
              { option: 'NEEL KASHKARI', votes: 1 },
              { option: 'TIM DONNELLY', votes: 1 },
              { option: '"BO" BOGDAN AMBROZEWICZ', votes: 0 },
              { option: 'AKINYEMI AGBEDE', votes: 0 },
              { option: 'RICHARD WILLIAM AGUIRRE', votes: 0 },
              { option: 'ROBERT NEWMAN', votes: 0 },
              { option: 'CINDY L. SHEEHAN', votes: 2 },
              { option: 'JOE LEICHT', votes: 0 },
              { option: 'WRITE-INTO', votes: 0 },
              { option: 'WRITE-IN - KAREN JILL BERNAL', votes: 0 },
              { option: 'WRITE-IN - JIMELLE L. WALLS', votes: 0 },
              { option: 'WRITE-IN - NICKOLAS WILDSTAR', votes: 0 }
            ]
          }
        ]
      }).should.be.true();
    });
  });
});
