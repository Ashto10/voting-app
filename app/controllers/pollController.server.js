'use strict';

var Users = require('../models/users.js');
var Polls = require('../models/polls.js');
var mongoose = require('mongoose');

// in case of mistyped address, will keep mongoose from throwing a castType error
function validateId(id, callback) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return;
  } else {
    callback();
  }
}

function PollController() {
  
  this.createPoll = function (req, res) {
    var pollName = req.body.pollName;
    var options = req.body.options.filter((option) => option !== '').map((option, index) => {
      return {title: option, count: 0, id: index }
    });
    var userId = req.user._id;
    var newPoll = new Polls({
      name: pollName,
      creator: {
        creator_id: userId,
        creatorName: req.user.twitter.displayName
      },
      dateCreated: new Date(),
      description: req.body.description,
      voters: [],
      options: options
    });
    newPoll.save((err, doc) => {
      if (err) { throw err; }
      Users
        .update( {_id: userId } , { $push: { pollsCreated: {
          poll_id: doc._id,
          name: doc.name,
          description: doc.description,
          dateCreated: doc.dateCreated
        } } } )
        .exec((err, user) => {
          if (err) { throw err; }
          return res.redirect('/poll/' + doc._id);
        });
    });
  }
  
  this.findPoll = function (req, res, next) {
    let poll_id = req.params.poll_id;
    validateId(poll_id, () =>{
      throw new Error('This is not a valid code!');
    });
    Polls.findById(poll_id, {}, {lean: true}, (err, poll) => {
      if (err) { throw err }
      if (poll === null) { throw new Error('Poll does not exist') }
      
      let loggedIn = req.isAuthenticated();
      let voter = loggedIn? req.user._id.toString() : req.header('x-forwarded-for').split(',')[0];

      res.locals.loggedIn = req.isAuthenticated();
      res.locals.canVote = poll.voters.indexOf(voter) === -1 ? true : false;
      res.locals.poll = poll;
      res.locals.url = process.env.APP_URL + "poll/" + poll._id;
      
      next(null, req, res);
    });
  }
  
  this.vote = function (req, res) {
    let voter,
        poll_id = req.params.poll_id,
        option_id = req.params.option_id
    if (req.isAuthenticated()) {
      voter = req.user._id;
    } else {
      voter = req.header('x-forwarded-for').split(',')[0];
    }
    
    validateId(poll_id, () =>{
      throw new Error('This is not a valid code!');
    });
    Polls.findById(poll_id, (err, poll) => {
      if (err) { throw err; }
      if (poll === null) { throw new Error('Poll does not exist') }
      if (poll.voters.indexOf(voter) !== -1) { throw new Error('Already voted!') }
      
      let optionList = poll.options.map(option => {
        return option.id;
      });
      if(optionList.indexOf(option_id) === -1) { throw new Error('Not a valid option!') }
      
      Polls
        .update({ _id: poll_id }, { $push: { voters: voter } })
        .update({ _id: poll_id, 'options.id' : option_id }, { $inc: { "options.$.count" : 1 } })
        .exec((err, result) => {
          if (err) { throw err; }
          return res.redirect('back');
        });
    });
  }
  
  this.addNewOption = function (req, res) {
    var newOption = req.body.customOption;
    var voter = req.user._id;
    var poll_id = req.params.poll_id;
    Polls.findById(poll_id, (err, poll) => {
      if (err) { throw err; }
      if (poll === null) { throw new Error('Poll does not exist') }
      if (poll.voters.indexOf(voter) !== -1) { throw new Error('Already voted!') }
      
      Polls
        .update({ _id: poll_id }, { $push: { voters: voter } })
        .update({ _id: poll_id }, { $push: { options: {title: newOption, count: 1} } })
        .exec((err, result) => {
          if (err) { throw err; }
          return res.redirect('back');
        });
    });
  }
  
  this.deletePoll = function (req, res) {
    var poll_id = req.params.poll_id;
    var userId = req.user._id;
    
    validateId(poll_id, () =>{
      throw new Error('This is not a valid code!');
    });
    
    Polls.findByIdAndRemove(poll_id, (err, poll) => {
      if (err) { throw err; }
      Users
        .update( {_id: userId} , { $pull: { pollsCreated: {poll_id: poll._id, pollName: poll.name} } } )
        .exec((err, user) => {
          if (err) { throw err; }
          return res.redirect('back');
        })
    })
  }
  
  this.getLatestPolls = function (count) {
    return Polls
      
      .find({}).limit(count).sort({dateCreated: -1})
      .exec();
    
  }
  
}

module.exports = PollController;