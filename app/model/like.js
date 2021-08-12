// app/model/article_like.js
'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const likeSchema = new Schema({
    user: { // 点赞用户
      type: mongoose.ObjectId,
      ref: 'User',
      required: true,
    },
    article: { // 点赞文章
      type: mongoose.ObjectId,
      ref: 'Article',
      required: true,
    },
    createdAt: { // 创建时间
      type: Date,
      default: Date.now,
    },
    updatedAt: { // 更新时间
      type: Date,
      default: Date.now,
    },
  });

  return mongoose.model('ArticleLike', likeSchema);
};