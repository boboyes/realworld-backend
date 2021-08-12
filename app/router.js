'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const auth = app.middleware.auth();
  router.prefix('/api');
  router.get('/', controller.home.index);

  router.post('/users/login', controller.user.login);
  router.post('/users', controller.user.register);
  router.get('/user',auth, controller.user.getCurrentUser);
  router.patch('/user',auth, controller.user.updateUser);

  router.get('/profiles/:username', controller.profile.getProfile);
  router.post('/profiles/:username/follow',auth, controller.profile.followUser);
  router.delete('/profiles/:username/follow',auth, controller.profile.unfollowUser);

  router.get('/articles', app.middleware.auth({ required: false }), controller.article.getArticles);
  router.get('/articles/feed',auth, controller.article.getFeedArticles);
  router.get('/articles/:slug',app.middleware.auth({ required: false }), controller.article.getArticle);
  router.post('/articles',auth, controller.article.createArticle);
  router.patch('/articles/:slug',auth, controller.article.updateArticle);
  router.delete('/articles/:slug',auth, controller.article.deleteArticle);
  router.post('/articles/:slug/comments',auth, controller.article.createComment);
  router.get('/articles/:slug/comments',auth, controller.article.getComments);
  router.delete('/articles/:slug/comments/:id',auth, controller.article.deleteComment);
  router.post('/articles/:slug/favorite',auth, controller.article.favoriteArticle);
  router.delete('/articles/:slug/favorite',auth, controller.article.unfavoriteArticle);

  router.get('/tags', controller.tag.getTags);
};
