'use strict';

(function () {
  // Replies Controller Spec
  describe('Replies Controller Tests', function () {
    // Initialize global variables
    var RepliesController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Replies,
      mockReply;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Replies_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Replies = _Replies_;

      // create mock reply
      mockReply = new Replies({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Reply about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Replies controller.
      RepliesController = $controller('RepliesController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one reply object fetched from XHR', inject(function (Replies) {
      // Create a sample replies array that includes the new reply
      var sampleReplies = [mockReply];

      // Set GET response
      $httpBackend.expectGET('api/replies').respond(sampleReplies);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.replies).toEqualData(sampleReplies);
    }));

    it('$scope.findOne() should create an array with one reply object fetched from XHR using a replyId URL parameter', inject(function (Replies) {
      // Set the URL parameter
      $stateParams.replyId = mockReply._id;

      // Set GET response
      $httpBackend.expectGET(/api\/replies\/([0-9a-fA-F]{24})$/).respond(mockReply);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.reply).toEqualData(mockReply);
    }));

    describe('$scope.create()', function () {
      var sampleReplyPostData;

      beforeEach(function () {
        // Create a sample reply object
        sampleReplyPostData = new Replies({
          title: 'An Reply about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An Reply about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (Replies) {
        // Set POST response
        $httpBackend.expectPOST('api/replies', sampleReplyPostData).respond(mockReply);

        // Run controller functionality
        scope.create(true);
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the reply was created
        expect($location.path.calls.mostRecent().args[0]).toBe('replies/' + mockReply._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/replies', sampleReplyPostData).respond(400, {
          message: errorMessage
        });

        scope.create(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock reply in scope
        scope.reply = mockReply;
      });

      it('should update a valid reply', inject(function (Replies) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/replies\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/replies/' + mockReply._id);
      }));

      it('should set scope.error to error response message', inject(function (Replies) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/replies\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update(true);
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(reply)', function () {
      beforeEach(function () {
        // Create new replies array and include the reply
        scope.replies = [mockReply, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/replies\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockReply);
      });

      it('should send a DELETE request with a valid replyId and remove the reply from the scope', inject(function (Replies) {
        expect(scope.replies.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.reply = mockReply;

        $httpBackend.expectDELETE(/api\/replies\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to replies', function () {
        expect($location.path).toHaveBeenCalledWith('replies');
      });
    });
  });
}());
