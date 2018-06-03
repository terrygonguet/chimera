describe('Project', function () {

  describe('#create()', function () {

    it('should create a blank project with no parameters', function () {
      let project = Project.create();
      expect(project).to.deep.include({
        name: "",
        description: "",
        type: Project.Type.project,
        default_increase: 1,
        default_priority: 1,
        tick_every: { days: 1 },
      });
    });

    it('should create a project with supplied parameters', function () {
      let project = Project.create({
        name: "Test",
        description: "Test",
        type: Project.Type.singleTask,
        default_increase: 2,
        default_priority: 2,
        tick_every: { days: 3 },
      });
      expect(project).to.deep.include({
        name: "Test",
        description: "Test",
        type: Project.Type.singleTask,
        default_increase: 2,
        default_priority: 2,
        tick_every: { days: 3 },
      });
    });

    it('should create a project with supplied parameters', function () {
      let project = Project.create({
        id:          "Test",
        createdAt:   0,
        sessions:    ["1"],
        tasks:       ["1"],
        sorted:      false,
        updatedAt:   0
      });
      let now = Date.now();
      expect(project).to.deep.include({
        createdAt:   now,
        sessions:    [],
        tasks:       [],
        sorted:      true,
        updatedAt:   now
      });
      expect(project).to.not.include({ id:"Test" });
    });

  });

  describe('#addTask()', function () {

    it('should create a blank task with no parameters', function () {
      let project = Project.create();
      Project.addTask(project);
      expect(project.tasks.length).to.eql(1);
      expect(project.tasks[0]).to.deep.include({
        name:"",
        url:"",
        priority:1,
        increase:1,
        done:false,
        expected_duration: { days:1 }
      });
    });

    it('should create a task with project settings', function () {
      let project = Project.create({
        default_increase:2,
        default_priority:3
      });
      Project.addTask(project);
      expect(project.tasks.length).to.eql(1);
      expect(project.tasks[0]).to.deep.include({
        name:"",
        url:"",
        priority:3,
        increase:2,
        done:false,
        expected_duration: { days:1 }
      });
    });

    it('should create a task with supplied parameters', function () {
      let project = Project.create();
      Project.addTask(project, {
        name:"Test",
        url:"http://test.com/",
        priority:5,
        expected_duration: { hours:3 }
      });
      expect(project.tasks.length).to.eql(1);
      expect(project.tasks[0]).to.deep.include({
        name:"Test",
        url:"http://test.com/",
        priority:5,
        increase:1,
        done:false,
        expected_duration: { hours:3 }
      });
    });

  });

  describe('#setTaskDone()', function () {

    it('should set the task done', function () {
      let project = Project.create();
      let task = Project.addTask(project);
      Project.setTaskDone(project, task.id);
      expect(task.done).to.be.true;
    });

  });

  describe('#getTask()', function () {

    it('should get the task', function () {
      let project = Project.create();
      let task = Project.addTask(project);
      expect(Project.getTask(project, task.id)).to.eql(task);
    });

    it('should return null if not here', function () {
      let project = Project.create();
      expect(Project.getTask(project, tools.uuidv4())).to.be.undefined;
    });

  });

  describe('#removeTask()', function () {

    it('should remove the task', function () {
      let project = Project.create();
      let task = Project.addTask(project);
      Project.removeTask(project, task.id);
      expect(project.tasks.length).to.eql(0);
    });

    it('should remove the task and linked sessions', function () {
      let project = Project.create();
      let task = Project.addTask(project);
      Project.start(project);
      Project.finish(project);
      Project.start(project, task.id);
      Project.finish(project, task.id);

      expect(project.tasks.length).to.eql(1);
      expect(project.sessions.length).to.eql(2);

      Project.removeTask(project, task.id, true);

      expect(project.tasks.length).to.eql(0);
      expect(project.sessions.length).to.eql(1);
      expect(project.sessions[0]).to.include({ task:null });
    });

  });

  describe('#sort()', function () {

    it('should sort the tasks', function () {
      let project = Project.create();
      let task1 = Project.addTask(project, {
        priority:1,
        name:'task1'
      });
      let task2 = Project.addTask(project, {
        priority:2,
        name:'task2'
      });
      expect(project.tasks[0]).to.include({ name:'task1' });
      expect(project.tasks[1]).to.include({ name:'task2' });
      Project.sort(project);
      expect(project.tasks[0]).to.include({ name:'task2' });
      expect(project.tasks[1]).to.include({ name:'task1' });
    });

  });

  describe('#tick()', function () {

    it('should tick the tasks', function () {
      let project = Project.create();
      let oneDay = moment.duration({ days:-1, seconds:-1 });
      project.updatedAt = moment().add(oneDay);
      let task = Project.addTask(project);
      expect(task.priority).to.eql(1);
      Project.tick(project);
      expect(task.priority).to.eql(2);
    });

  });

  describe('#tickAndSort()', function () {

    it('should tick and sort the tasks', function () {
      let project = Project.create();
      let oneDay = moment.duration({ days:-1, seconds:-1 });
      project.updatedAt = moment().add(oneDay);
      let task1 = Project.addTask(project, {
        priority:1,
        name:'task1'
      });
      let task2 = Project.addTask(project, {
        priority:2,
        name:'task2'
      });
      expect(project.tasks[0]).to.include({ name:'task1', priority:1 });
      expect(project.tasks[1]).to.include({ name:'task2', priority:2 });
      Project.tickAndSort(project);
      expect(project.tasks[0]).to.include({ name:'task2', priority:3 });
      expect(project.tasks[1]).to.include({ name:'task1', priority:2 });
    });

  });

  describe('#start()', function () {

    it('should create and start a session if none exist', function () {
      let project = Project.create();
      Project.start(project);
      expect(project.sessions.length).to.eql(1);
      expect(project.sessions[0].events.length).to.eql(1);
      expect(Session.getState(project.sessions[0])).to.eql(Session.State.running);
    });

    it('should do nothing if a session already exist', function () {
      let project = Project.create();
      Project.start(project);
      Project.start(project);
      expect(project.sessions.length).to.eql(1);
      expect(project.sessions[0].events.length).to.eql(1);
      expect(Session.getState(project.sessions[0])).to.eql(Session.State.running);
    });

    it('should resume a paused session', function () {
      let project = Project.create();
      Project.start(project);
      Project.pause(project);
      Project.start(project);
      expect(project.sessions.length).to.eql(1);
      expect(project.sessions[0].events.length).to.eql(3);
      expect(Session.getState(project.sessions[0])).to.eql(Session.State.running);
    });

  });

  describe('#pause()', function () {

    it('should pause a session', function () {
      let project = Project.create();
      Project.start(project);
      Project.pause(project);
      expect(project.sessions.length).to.eql(1);
      expect(project.sessions[0].events.length).to.eql(2);
      expect(Session.getState(project.sessions[0])).to.eql(Session.State.paused);
    });

    it('should do nothing if a paused session already exist', function () {
      let project = Project.create();
      Project.start(project);
      Project.pause(project);
      Project.pause(project);
      expect(project.sessions.length).to.eql(1);
      expect(project.sessions[0].events.length).to.eql(2);
      expect(Session.getState(project.sessions[0])).to.eql(Session.State.paused);
    });

  });

  describe('#pause()', function () {

    it('should finish a session', function () {
      let project = Project.create();
      Project.start(project);
      Project.finish(project);
      expect(project.sessions.length).to.eql(1);
      expect(project.sessions[0].events.length).to.eql(2);
      expect(Session.getState(project.sessions[0])).to.eql(Session.State.finished);
    });

    it('should do nothing if all sessions are finished', function () {
      let project = Project.create();
      Project.start(project);
      Project.finish(project);
      Project.finish(project);
      expect(project.sessions.length).to.eql(1);
      expect(project.sessions[0].events.length).to.eql(2);
      expect(Session.getState(project.sessions[0])).to.eql(Session.State.finished);
    });

  });

  describe('#getDuration()', function () {

    it('should return the duration of everything', function () {
      let project = Project.create();
      let task = Project.addTask(project);

      Project.start(project);
      project.sessions[0].events[0].time = moment().add(moment.duration({ hours:-1 }));
      Project.finish(project);

      Project.start(project, task.id);
      project.sessions[1].events[0].time = moment().add(moment.duration({ hours:-3 }));
      Project.finish(project, task.id);

      let duration = Project.getDuration(project);
      expect(Math.round(duration.asHours())).to.eql(4);
    });

    it('should return the duration of one task', function () {
      let project = Project.create();
      let task = Project.addTask(project);

      Project.start(project);
      project.sessions[0].events[0].time = moment().add(moment.duration({ hours:-1 }));
      Project.finish(project);

      Project.start(project, task.id);
      project.sessions[1].events[0].time = moment().add(moment.duration({ hours:-3 }));
      Project.finish(project, task.id);

      let duration = Project.getDuration(project, task.id);
      expect(Math.round(duration.asHours())).to.eql(3);
    });

  });

});
