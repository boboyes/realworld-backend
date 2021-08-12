'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true,
      select: false //查询忽略
    },
    bio: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    subscribersCount: {
      type: Number,
      default: 0,
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
  return mongoose.model('User', userSchema)
}