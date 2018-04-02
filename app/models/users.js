'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var User = new Schema({
  twitter: {
    id: String,
    displayName: String,
    iconURL: String
  },
  pollsCreated: [{
    poll_id: String,
    name: String,
    description: String,
    dateCreated: Date
  }]
});

module.exports = mongoose.model('User', User);