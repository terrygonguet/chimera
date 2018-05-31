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
    project.tasks.push(
      Task.create(
        Object.assign({
          priority: project.default_priority,
          increase: project.default_increase
        }, props)
      )
    );
  }

  static setTaskDone(project, taskId, done=true) {
    Project.getTask(project, taskId).done = done;
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

  static start(project) {
    
  }

  static pause(project) {

  }

  static finish(project) {

  }

}

// shorthand
Project.ts = Project.tickAndSort;

Project.Type = {
  project:'project',
  todoList:'todoList',
  singleTask:'singleTask'
}
