'use strict';

describe('Replies E2E Tests:', function () {
  describe('Test replies page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/replies');
      expect(element.all(by.repeater('reply in replies')).count()).toEqual(0);
    });
  });
});
