import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/article/detail', controller.article.getArticleDetail);
  router.get('/list/nav', controller.article.getNavList);
  router.get('/article/info', controller.article.getArticleInfo);
};
