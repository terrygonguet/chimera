describe('Session', function () {

  describe('#create()', function () {

    it('should create a task', function () {
      let task = Task.create();
      expect(task).to.deep.include({
        name:              "",
        url:               "",
        priority:          1,
        increase:          1,
        done:              false,
        expected_duration: { days: 1 }
      });
      task = Task.create({
        name:'test',
        url:'http://test.com',
        priority:3,
        increase:2,
        expected_duration: { hours:1 }
      });
      expect(task).to.deep.include({
        name:'test',
        url:'http://test.com',
        priority:3,
        increase:2,
        expected_duration: { hours:1 }
      });
    });

  });

});
