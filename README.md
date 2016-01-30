# mean-replies
Comments system for MEANJS

cd (your-project)/modules
git clone https://github.com/tutley/mean-replies.git replies

There is a little bit of integration work to get this integrated with an existing MEAN.JS app. You can see what I've done to make it work at https://github.com/tutley/mean.git

** Note: I made this with the latest mean repo, which is using updated versions of bootstrap and other things. So if you're using the yeoman generator to start your mean stack, you may have to edit some things (uib-collapse for example)

### Changes to Existing MEANJS template
#### 1 - Edit the Article model to have a reply count and an array of replies
#### 2 - bower install moment and angular-moment, include them in your assets, add 'angularMoment' to core app config dependencies
####  - Edit the Article client router to have the following Article:view

    .state('articles.view', {
      url: '/:articleId',
      views: {
        '@' : {
          templateUrl: 'modules/articles/client/views/view-article.client.view.html'
        },
        'replies@articles.view' : {
          templateUrl: 'modules/replies/client/views/list-replies.client.view.html',
          controller: 'RepliesController'
        }
      },
      controller: 'ArticlesController',
      controllerAs: 'vm',
      resolve: {
        articleResolve: getArticle
      }
    }) 
