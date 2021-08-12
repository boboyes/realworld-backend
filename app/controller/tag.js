'use strict';

const Controller = require('egg').Controller;

class TagController extends Controller {
  async getTags () {
    const tagList = await this.app.model.Tag.find()
    this.ctx.body = {
      tags: tagList.map(item => item.tag)
    }
  }
}

module.exports = TagController;