/*
Session
{
  id          : UUID
  task:       : UUID
  events      : Array<Session.Event>
}

*/

class Session {

  static create(props={}) {
    return Object.assign({
      task:        null,
    },
    props,
    {
      id:          tools.uuidv4(),
      events:      []
    });
  }

  static getState(task) {
    switch (task.events[task.events.length - 1].type) {
      case Session.Event.Type.started:
      case Session.Event.Type.resumed:
        return Session.State.running;
      case Session.Event.Type.paused:
        return Session.State.paused;
      case Session.Event.Type.finished:
        return Session.State.finished;
    }
  }

  static start(task) {
    if (!task.events.length) {
      task.events.push(Session.Event.create());
    } else if (Session.getState(task) === Session.State.paused) {
      task.events.push(Session.Event.create(Session.Event.Type.resumed));
    } else {
      console.error('Invalid state to start : ' + Session.getState(task));
    }
  }

  static pause(task) {
    if (Session.getState(task) === Session.State.running) {
      task.events.push(Session.Event.create(Session.Event.Type.paused));
    } else {
      console.error('Invalid state to pause : ' + Session.getState(task));
    }
  }

  static finish(task) {
    task.events.push(Session.Event.create(Session.Event.Type.finished));
  }

}

Session.State = {
  running: "running",
  paused: "paused",
  finished: "finished",
}

/*
Session.Event
{
  id          : UUID
  type        : Session.Event.Type
  time        : Timestamp
}

*/

Session.Event = class Event {

  static create(type) {
    return {
      id: tools.uuidv4(),
      type: type || Session.Event.Type.started,
      time: Date.Now()
    };
  }

}

Session.Event.Type = {
  started: "started",
  paused: "paused",
  resumed: "resumed",
  finished: "finished",
}
