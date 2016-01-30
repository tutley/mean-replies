'use strict';

// Replies controller
angular.module('replies').controller('RepliesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Replies', 'RecursionHelper', 
  function ($scope, $stateParams, $location, Authentication, Replies, RecursionHelper) {
    $scope.authentication = Authentication;
    // Init the new top level reply Form
    $scope.topReply = {};
    $scope.topReplyCollapsed = true;
    $scope.topReplyAvailable = (Authentication.user);


    // There is probably a better way to do this. I'm using these helper functions
    // in conjunction with the ui.bootsrap "collapse" tag to show/hide things
    $scope.showReplyForm = function(replyId) {
      $scope.currentReplyId = replyId;  
    };
    $scope.cancelReply = function() {
      $scope.currentReplyId = null;
    };

    $scope.prepareDelete = function(replyId) {
      $scope.replyToDelete = replyId;  
    };
    $scope.cancelDelete = function() {
      $scope.replyToDelete = null;
    };

    $scope.prepareEdit = function(reply) {
      reply.newContent = reply.content;
      $scope.replyToEdit = reply._id;  
    };
    $scope.cancelEdit = function() {
      $scope.replyToEdit = null;
    };

    $scope.cancelTopReply = function() {
      $scope.topReply.content = '';
    };

    // $scope.prepareReport = function(replyId) {
    //   $scope.replyToReport = replyId;  
    // };
    // End show/hide stuff

    // CRUD Operations
    // Create a new top level reply
    $scope.createTop = function(articleId) {
      $scope.topReply.error = null;
      var newTopReply = $scope.topReply;

      var reply = new Replies(newTopReply);
      reply.article = articleId;
      reply.nestedLevel = 1;

      reply.$save(function(response) {
        $scope.replies.unshift(response);
        $scope.topReply = {};
        $scope.topReplyAvailable = false;
      }, function(errorResponse) {
        $scope.topReply.error = errorResponse.data.message;
      });
    };

    // Create new Reply where replyId is the _id of the reply we're replying to
    $scope.create = function (currentReply) {
      currentReply.error = null;
      // First make sure there's actually something in the reply
      // TODO: provide an error or feedback somehow
      if (!currentReply.newReply) {
        currentReply.error = 'The reply was empty!';
        return false;
      }
      // Now check that they haven't somehow replied to a level 9 reply
      var newReplyLevel = currentReply.nestedLevel + 1;
      if (newReplyLevel > 9) {
        currentReply.error = 'how the hell did you do that?';
        return false;
      }

      // Construct a new reply to send to the api
      var reply = new Replies({
        content: currentReply.newReply,
        article: currentReply.article,
        replyTo: currentReply._id,
        nestedLevel: newReplyLevel
      });

      // Use resource to hit the server api, then push the reply into the current view
      reply.$save(function (response) {
        currentReply.replies.unshift(response); 
        currentReply.newReply='';
        $scope.currentReplyId = null;
      }, function (errorResponse) {
        currentReply.error = errorResponse.data.message;
      });
    };

    // Remove existing Reply
    $scope.remove = function (reply) {
      if (reply) {
        var deadManWalking = new Replies(reply);
        deadManWalking.$remove({},
          //success
          function(value){
            // brute force method of removing the reply from view
            // $scope.find();

            // TODO: find a way to remove this one directive rather than just collapsing it
            reply.isDeleted = true;
          },
          //error
          function(error){
            reply.error = error.data.message;
          }
        );
      }
    };

    // Update existing Reply
    $scope.update = function (currentReply) {
      currentReply.error = null;

      if (!currentReply.newContent) {
        currentReply.error = 'The reply was empty!';
        return false;
      }
      if (currentReply.newContent === currentReply.content) {
        currentReply.error = 'You did not change anything!';
        return false;
      }

      var reply = new Replies(currentReply);
      reply.content = currentReply.newContent;

      reply.$update(function (response) {
        currentReply.content = response.content;
        currentReply.edited = response.edited;
        $scope.replyToEdit = null;
      }, function (errorResponse) {
        currentReply.error = errorResponse.data.message;
      });
    };

    // Find a list of Replies
    $scope.find = function () {
      var articleId = $stateParams.articleId;

      Replies.query({ 'article' : articleId }, function(response) {  
        $scope.replies = response;
        //troubleshooting
        $scope.prettyReplies = JSON.stringify(response, null, 2);
        // Init Toggles 
        // TODO: do this reply toggle init better
        $scope.isCollapsed = {};
        angular.forEach($scope.replies, function(reply){
          // check the top level to see if this user already replied
          if (reply.user._id === Authentication.user._id) {
            $scope.topReplyAvailable = false;
          }
          $scope.isCollapsed[reply._id] = false;
          angular.forEach(reply.replies, function(reply){
            $scope.isCollapsed[reply._id] = true;
            angular.forEach(reply.replies, function(reply){
              $scope.isCollapsed[reply._id] = false;
              angular.forEach(reply.replies, function(reply){
                $scope.isCollapsed[reply._id] = false;
                angular.forEach(reply.replies, function(reply){
                  $scope.isCollapsed[reply._id] = false;
                  angular.forEach(reply.replies, function(reply){
                    $scope.isCollapsed[reply._id] = false;
                    angular.forEach(reply.replies, function(reply){
                      $scope.isCollapsed[reply._id] = false;
                      angular.forEach(reply.replies, function(reply){
                        $scope.isCollapsed[reply._id] = false;
                        angular.forEach(reply.replies, function(reply){
                          $scope.isCollapsed[reply._id] = false;
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });    
    };

    // Find existing Reply
    $scope.findOne = function () {
      $scope.reply = Replies.get({
        replyId: $stateParams.replyId
      });
    };
  }
]);

