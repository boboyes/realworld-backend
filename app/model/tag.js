'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const tagSchema = new mongoose.Schema({
    tag: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  })
  return mongoose.model('Tag', tagSchema)
}