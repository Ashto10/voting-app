'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Poll = new Schema({
  name: String,
  creator: {
    creator_id: String,
    creatorName: String
  },
  dateCreated: Date,
  description: String,
  voters: [String],
  options: [{
    title: String,
    id: String,
    count: Number
  }]
});

module.exports = mongoose.model('Poll', Poll);