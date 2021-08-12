'use strict';

module.exports = app => {
  const mongoose = app.mongoose

  const articleSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    tagList: {
      type: [String],
      default: null
    },
    favoritesCount: {
      type: Number,
      default: 0
    },
    commentsCount: { // 评论数量
      type: Number,
      default: 0,
    },
    author: {
      type: mongoose.ObjectId,
      ref: 'User',
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
  return mongoose.model('Article', articleSchema)
}