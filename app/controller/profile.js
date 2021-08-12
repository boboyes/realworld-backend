'use strict';

const Controller = require('egg').Controller;

class ProfileController extends Controller {
  async getProfile () {
     // 1. 获取关注状态
     let following = false;
     const channelUsername = this.ctx.params.username;
     const channelUser = await this.service.user.findByUsername(channelUsername)
     if (!channelUser) {
       this.ctx.throw(422, '用户不存在');
     } 
     if (this.ctx.user) {
       const record = await this.app.model.Subscription.findOne({
         user: this.ctx.user._id,
         channel: channelUser._id,
       });
       if (record) following = true;
     }
     // 2. 获取用户信息
    const user = await this.app.model.User.findById(channelUser._id);
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'bio',
          'image',
        ]),
        following,
      },
    };

  }
  async followUser () {
    const userId = this.ctx.user._id;
    const channelUsername = this.ctx.params.username;
    const channelUser = await this.service.user.findByUsername(channelUsername)
    if (!channelUser) {
      this.ctx.throw(422, '用户不存在');
    } 
    if (userId.equals(channelUser._id)) {
      this.ctx.throw(422, '用户不能订阅自己');
    }
    // 2. 添加订阅
    const user = await this.service.user.subscribe(userId, channelUser._id);
    // 3. 发送响应
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'bio',
          'image',
        ]),
        following: true,
      },
    };

  }
  async unfollowUser () {
    const userId = this.ctx.user._id;
    const channelUsername = this.ctx.params.username;
    const channelUser = await this.service.user.findByUsername(channelUsername)
    if (!channelUser) {
      this.ctx.throw(422, '用户不存在');
    } 
    // 1. 用户不能订阅自己
    if (userId.equals(channelUser._id)) {
      this.ctx.throw(422, '用户不能订阅自己');
    }
    // 2. 取消订阅
    const user = await this.service.user.unsubscribe(userId, channelUser._id);
    // 3. 发送响应
    this.ctx.body = {
      user: {
        ...this.ctx.helper._.pick(user, [
          'username',
          'bio',
          'image',
        ]),
        following: false,
      },
    };
  }
}

module.exports = ProfileController;