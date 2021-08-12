'use strict';

const Controller = require('egg').Controller;

class ArticleController extends Controller {
  async getArticles () {
    const { Article, Like: ArticleLike, Subscription, User } = this.app.model;
    let { pageNum = 1, pageSize = 10, username } = this.ctx.query;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);

    const options = {}
    if (username) {
      const user = await User.findOne({ username: username})
      console.log(user)
      options.author = user._id
    }
    console.log(options, username)
    const getArticles = Article.find(options)
      .populate('author')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);
    const getArticlesCount = Article.countDocuments(options);

    const [ articles, articlesCount ] = await Promise.all([
      getArticles,
      getArticlesCount,
    ]);
    if (this.ctx.user) {
      const userId = this.ctx.user._id;
      const favoriteDoc = await ArticleLike.find({ user: userId });
      const followingDoc = await Subscription.find({ user: userId });
      const articleFavorite = favoriteDoc.map(item => item.toJSON().article)
      const userFollowing = followingDoc.map(item => item.toJSON().channel)

      const myarticles = articles.map(item => {
        let following = false
        let favorited = false
        if (userFollowing.find(ite => item.author._id.equals(ite))) {
          following = true
        }
        if (articleFavorite.find(ite => item._id.equals(ite))) {
          favorited = true
        }
        return {
          ...item.toJSON(),
          author: {
            ...item.author.toJSON(),
            following
          },
          favorited: favorited
        }
      })

      this.ctx.body = {
        articles: myarticles,
        articlesCount
      };
    } else {
      const myarticles = articles.map(item => {
        let following = false
        let favorited = false
        return {
          ...item.toJSON(),
          author: {
            ...item.author.toJSON(),
            following
          },
          favorited: favorited
        }
      })

      this.ctx.body = {
        articles: myarticles,
        articlesCount
      };
    }
    
  }
  async getFeedArticles () {
    const { Article, Like: ArticleLike, Subscription} = this.app.model;
    let { pageNum = 1, pageSize = 10 } = this.ctx.query;
    const userId = this.ctx.user._id;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);
    const channelArticles = await ArticleLike.find({ user: userId }).populate('article');
    const getArticles = Article.find({
      _id: {
        $in: channelArticles.map(item => item.article._id), // 关注用户的id列表
      },
    })
      .populate('author')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);
    const getArticlesCount = Article.countDocuments({
      _id: {
        $in: channelArticles.map(item => item.article._id), // 关注用户的id列表
      },
    });

    const [ articles, articlesCount ] = await Promise.all([
      getArticles,
      getArticlesCount,
    ]);

    const favoriteDoc = await ArticleLike.find({ user: userId });
    const followingDoc = await Subscription.find({ user: userId });
    const articleFavorite = favoriteDoc.map(item => item.toJSON().article)
    const userFollowing = followingDoc.map(item => item.toJSON().channel)
    const myarticles = articles.map(item => {
      let following = false
      let favorited = false
      if (userFollowing.find(ite => item.author._id.equals(ite))) {
        following = true
      }
      if (articleFavorite.find(ite => item._id.equals(ite))) {
        favorited = true
      }
      return {
        ...item.toJSON(),
        author: {
          ...item.author.toJSON(),
          following
        },
        favorited: favorited
      }
    })
    this.ctx.body = {
      articles: myarticles,
      articlesCount,
    };
  }
  async getArticle () {
    const { Article, Like: ArticleLike, Subscription } = this.app.model;
    const { slug } = this.ctx.params;
    let article = await Article.findById(slug).populate('author','_id username bio image following subscribersCount');
    if (!article) {
      this.ctx.throw(404, 'Video Not Found');
    }
    article = article.toJSON();

    article.favorited = false;
    article.author.following = false;
    console.log(this.ctx.user)
    if (this.ctx.user) {
      const userId = this.ctx.user._id;
      const alike = await ArticleLike.findOne({ user: userId, article: slug })
      console.log(alike)
      if (alike) {
        article.favorited = true;
      }
      const subs = await Subscription.findOne({ user: userId, channel: article.author._id })
      console.log(subs, 'subs')
      if (subs) {
        article.author.following = true;
      }
    }
    this.ctx.body = {
      article,
    };
  }
  async createArticle () {
    const { Article, Tag } = this.app.model
    const { body } = this.ctx.request;
    this.ctx.validate({
      title: { type: 'string' },
      description: { type: 'string' },
      body: { type: 'string' },
      tagList: { type: 'array', required: false}
    })
    body.author = this.ctx.user._id
    const article = await new Article(body).save();

    //存储tag
    let tagList = []
    if (body.tagList) {
      
    }
    this.ctx.status = 201;
    this.ctx.body = {
      article,
      tagList
    };
  }
  async updateArticle () {
    const { Article } = this.app.model
    const { body } = this.ctx.request;
    const { slug } = this.ctx.params
    const userId = this.ctx.user._id
    this.ctx.validate({
      title: { type: 'string', required: false},
      description: { type: 'string', required: false },
      body: { type: 'string', required: false },
    })
    //查询文章
    const article = await Article.findById(slug)
    if (!article) {
      this.ctx.throw(404, 'Article Not Found')
    }
    if (!article.author.equals(userId)) {
      this.ctx.throw(403, '无权限')
    }

    Object.assign(article, this.ctx.helper._.pick(body, ['title', 'description', 'body']))

    await article.save()

    this.ctx.body = {
      article
    };
  }
  async deleteArticle () {
    const { Article } = this.app.model
    const { body } = this.ctx.request;
    const { slug } = this.ctx.params
    const userId = this.ctx.user._id
    const article = await Article.findById(slug);
    if (!article) {
      this.ctx.throw(404);
    }
    if (!article.author.equals(userId)) {
      this.ctx.throw(403);
    }
    await article.remove();

    this.ctx.status = 204;
  }
  async createComment () {
    const { body } = this.ctx.request;
    const { Article, Comment: ArticleComment } = this.app.model;
    const { slug } = this.ctx.params;
    this.ctx.validate({
      body: 'string',
    });
    const article = await Article.findById(slug);
    if (!article) {
      this.ctx.throw(404);
    }

    const comment = await new ArticleComment({
      body: body.body,
      author: this.ctx.user._id,
      article: slug,
    }).save();

    article.commentsCount = await ArticleComment.countDocuments({
      article: slug,
    });
    await article.save();

    await comment.populate('author').populate('article').execPopulate();
     // 响应
    this.ctx.body = {
      comment,
    };
  }
  async getComments () {
    const { Comment: ArticleComment } = this.app.model;
    const slug = this.ctx.params.slug;
    let { pageNum = 1, pageSize = 10 } = this.ctx.query;
    pageNum = Number.parseInt(pageNum);
    pageSize = Number.parseInt(pageSize);

    const getComments = ArticleComment.find({
      article: slug,
    })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .sort({
        createdAt: -1
      })
      .populate('author')
      .populate('article');
    const getCommentsCount = ArticleComment.countDocuments({
      article: slug,
    });

    const [ comments, commentsCount ] = await Promise.all([
      getComments,
      getCommentsCount,
    ]);
    this.ctx.body = {
      comments,
      commentsCount,
    };
  }
  async deleteComment () {
    const { Article, Comment: ArticleComment } = this.app.model;
    const { slug, id } = this.ctx.params;

    // 检查视频是否存在
    const article = await Article.findById(slug);
    if (!article) this.ctx.throw(404, 'Video Not Found');

    // 检查评论是否存在
    const comment = await ArticleComment.findById(id);
    if (!comment) this.ctx.throw(404, 'Comment Not Found');

    // 检查评论作者是否是当前用户
    if (!comment.author.equals(this.ctx.user._id)) this.ctx.throw(403);

    // 删除视频评论
    await comment.remove();

    // 更新视频评论数量
    article.commentsCount = await ArticleComment.countDocuments({
      article: slug,
    });
    await article.save();

    // 响应
    this.ctx.status = 204;
  }
  async favoriteArticle () {
    const { Article, Like: ArticleLike } = this.app.model;
    const { slug } = this.ctx.params;
    const userId = this.ctx.user._id;
    const article = await Article.findById(slug);
    if (!article) this.ctx.throw(404, 'Video Not Found');
    
    const doc = await ArticleLike.findOne({ user: userId, article: slug });

    if (doc) {
      this.ctx.throw(404, 'Article is Liked');
    }
    await new ArticleLike({
      user: userId,
      article: slug,
    }).save();

    article.favoritesCount = await ArticleLike.countDocuments({ 
      article: slug,
    })
    // 保存到数据库
    await article.save();
    this.ctx.body = {
      article: {
        ...article.toJSON(),
        favorited: true,
      },
    };
  }
  async unfavoriteArticle () {
    const { Article, Like: ArticleLike } = this.app.model;
    const { slug } = this.ctx.params;
    const userId = this.ctx.user._id;
    const article = await Article.findById(slug);
    if (!article) this.ctx.throw(404, 'Video Not Found');
    
    const doc = await ArticleLike.findOne({ user: userId, article: slug });

    if (!doc) {
      this.ctx.throw(404, 'Article is unLiked');
    }
    await doc.remove();

    article.favoritesCount = await ArticleLike.countDocuments({ 
      article: slug,
    })
    // 保存到数据库
    await article.save();
    this.ctx.body = {
      article: {
        ...article.toJSON(),
        favorited: false,
      },
    };
  } 
}

module.exports = ArticleController;