/*
Project
{
  id               : UUID
  name             : String
  description      : String
  type             : Project.Type
  createdAt        : Timestamp
  color            : HTMLColor
  default_priority : Number
  default_increase : Number
  tick_every       : Object
  updatedAt        : Timestamp
  sessions         : Array<Session>
  tasks            : Array<Task>
}

*/

class Project {

  static create(props={}) {
    return Object.assign({
      name:             "",
      description:      "",
      type:             Project.Type.project,
      color:            tools.randColor(),
      default_increase: 1,
      default_priority: 1,
      tick_every:       { days: 1 },
    },
    props,
    {
      id:          tools.uuidv4(),
      createdAt:   Date.now(),
      sessions:    [],
      tasks:       [],
      sorted:      true,
      updatedAt:   Date.now()
    });
  }

  static addTask(project, props={}) {
    let task = Task.create(
      Object.assign({
        priority: project.default_priority,
        increase: project.default_increase
      }, props)
    );
    project.tasks.push(task);
    project.sorted = false;
    return task;
  }

  static setTaskDone(project, taskId, done=null) {
    let task = Project.getTask(project, taskId);
    if (done === null)
      task.done = !task.done;
    else
      task.done = done;
    project.sorted = false;
    return project;
  }

  static getTask(project, taskId) {
    return project.tasks.find(t => t.id === taskId);
  }

  static removeTask(project, taskId, removeSessions=false) {
    let index = project.tasks.findIndex(t => t.id === taskId);
    if (index != -1) {
      project.tasks.splice(index, 1)
      if (removeSessions) {
        project.sessions = project.sessions.filter(s => s.task !== taskId);
      }
    }
    project.sorted = false;
    return project;
  }

  static sort(project) {
    if (project.sorted) return project;
    project.tasks.sort((a,b) => {
      if (a.done === b.done) return (a.priority > b.priority ? -1 : (b.priority > a.priority ? 1 : 0));
      else if (a.done) return 1;
      else return -1;
    });
    project.sorted = true;
    return project;
  }

  static tick(project) {
    let updatedAt = moment(project.updatedAt),
        tickEvery = moment.duration(project.tick_every);
    // if we passed the time of update
    while (updatedAt.add(tickEvery).isBefore()) {
      project.tasks.forEach(t => t.priority += t.increase);
      project.updatedAt = updatedAt.valueOf();
    }
    project.sorted = false;
    return project;
  }

  static tickAndSort(project) {
    return Project.sort(Project.tick(project));
  }

  static start(project, taskId=null) {
    let startedSessions = project.sessions.filter(
      s => s.task === taskId && Session.getState(s) !== Session.State.finished
    );
    if (startedSessions.length > 1) {
      console.error("More than 1 active session for task : " + taskId);
    } else if (startedSessions.length) {
      Session.start(startedSessions[0]);
    } else { // no current session
      let session = Session.create({ task:taskId });
      Session.start(session);
      project.sessions.push(session);
    }

    return project;
  }

  static pause(project, taskId=null) {
    let startedSessions = project.sessions.filter(
      s => s.task === taskId && Session.getState(s) !== Session.State.finished
    );
    if (startedSessions.length > 1) {
      console.error("More than 1 active session for task : " + taskId);
    } else if (startedSessions.length) {
      Session.pause(startedSessions[0]);
    } else { // no current session
      console.error("No session to pause for task : " + taskId);
    }

    return project;
  }

  static finish(project, taskId=null) {
    let startedSessions = project.sessions.filter(
      s => s.task === taskId && Session.getState(s) !== Session.State.finished
    );
    if (startedSessions.length > 1) {
      console.error("More than 1 active session for task : " + taskId);
    } else if (startedSessions.length) {
      Session.finish(startedSessions[0]);
    } else { // no current session
      console.error("No session to finish for task : " + taskId);
    }

    return project;
  }

  static getDuration(project, allOrId=true) {
    let sessions;
    if (typeof allOrId === 'string') {
      sessions = project.sessions.filter(s => s.task === allOrId);
    } else if (allOrId) {
      sessions = project.sessions;
    } else {
      sessions = project.sessions.filter(s => s.task === null);
    }
    let duration = moment.duration();
    for (let session of sessions) {
      duration.add(Session.getDuration(session));
    }
    return duration;
  }

}

// shorthand
Project.ts = Project.tickAndSort;

Project.Type = {
  project:'project',
  todoList:'todoList',
  singleTask:'singleTask'
}
