'use strict';

const path = process.cwd();
var PollController = require(path + '/app/controllers/pollController.server.js');

function populateTemporary(req, res) {
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.user = req.user;
}

module.exports = function(app, passport) {
  
  function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
  }
  
  function isGuest (req, res, next) {
		if (!req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/profile');
		}
  }
  
  var pollController = new PollController();
  
  app.route('/')
    .get((req, res) => {
      populateTemporary(req, res);
      let count = req.isAuthenticated() ? 6 : 3;
      var promise = pollController.getLatestPolls(count).then(data => {
        res.locals.pollData = data;
        res.render('index', res.locals);
      });
    });
  
  app.route('/logout')
    .get(function (req, res) {
      req.logout();
      res.redirect('/');
    });
  
  app.route('/profile')
		.get(isLoggedIn,  (req, res) => {
      populateTemporary(req, res);
      console.log(res.locals.user.pollsCreated);
			res.render('profile', res.locals);
		});
  
  app.route('/poll/:poll_id')
    .get(pollController.findPoll, (req, res) => {
      populateTemporary(req, res);
      res.render('polls', res.locals);
    });
  
  app.route('/poll/:poll_id/delete')
    .get(pollController.deletePoll, (req,res) => {
      res.redirect('back');
    });
  
  app.route('/poll/new')
    .post(isLoggedIn, pollController.createPoll);
  
  app.route('/api/poll/:poll_id/vote/:option_id')
    .get(pollController.vote);
  
  app.route('/api/poll/:poll_id/newVote')
    .post(pollController.addNewOption);
  
  app.route('/auth/twitter')
    .get(passport.authenticate('twitter'));
  
  app.route('/auth/twitter/callback')
    .get(passport.authenticate('twitter', {
      successRedirect: '/logResult',
      failureRedirect: '/logResult'
    }));
  
  app.route('/logResult')
    .get((req,res) => {
      res.render('login');
    });
  
  app.route('/*')
    .get((req, res) => {
        res.status('404').send({error: 404});
     })

}