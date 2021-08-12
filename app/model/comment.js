'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const commentSchema = new mongoose.Schema({
    body: {
      type: String,
      required: true
    },
    author: { // 评论用户
      type: mongoose.ObjectId,
      ref: 'User',
      required: true,
    },
    article: { // 评论视频
      type: mongoose.ObjectId,
      ref: 'Article',
      required: true,
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
  return mongoose.model('Comment', commentSchema)
}