describe('Session', function () {

  describe('#create()', function () {

    it('should create a session', function () {
      let session = Session.create();
      expect(session).to.deep.include({
        task: null,
        events: [],
      });
      let id = tools.uuidv4();
      session = Session.create({
        task:id
      });
      expect(session).to.deep.include({
        task: id,
        events: [],
      });
    });

  });

  describe('#getState()', function () {

    it('should be the right state', function () {
      let session = Session.create();
      expect(Session.getState(session)).to.eql(Session.State.empty);
      Session.start(session);
      expect(Session.getState(session)).to.eql(Session.State.running);
      Session.pause(session);
      expect(Session.getState(session)).to.eql(Session.State.paused);
      Session.start(session);
      expect(Session.getState(session)).to.eql(Session.State.running);
      Session.finish(session);
      expect(Session.getState(session)).to.eql(Session.State.finished);
    });

  });

  describe('#getDuration()', function () {

    it('should return the duration of the session', function () {
      let session = Session.create();
      Session.start(session);
      session.events[0].time = moment().add(moment.duration({ hours:-1 }));
      Session.finish(session);
      let duration = Session.getDuration(session);
      expect(Math.round(duration.asHours())).to.eql(1);
    });

  });

});
