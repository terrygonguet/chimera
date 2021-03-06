var bg, tab;
browser.tabs.query({ active:true, currentWindow:true })
.then(tabs => {
  tab = tabs[0];
});
browser.runtime.getBackgroundPage()
.then(win => {
  bg = win;
  let app = new Vue({
    el:'#container',
    data: {
      bg,
      projects: _.cloneDeep(bg.projects),
      settings: _.cloneDeep(bg.settings),
      selectedTaskId: "",
      isTicking: true,
      newProject: {
        isEditorOpened:false,
        name:"",
      },
      newTask: {
        isEditorOpened:false,
        name:"",
        includeURL:false,
        priority:1
      }
    },
    computed: {
      selected() {
        if (!this.projects[this.settings.selected]) this.settings.selected = null;
        if (!this.settings.selected && _.keys(this.projects).length) 
          this.settings.selected = _.keys(this.projects)[0];
        return this.projects[this.settings.selected];
      },
      selectedTask() {
        return bg.P.getTask(this.selected, this.selectedTaskId);
      },
      selectedTaskState() {
        return bg.P.getTaskState(this.selected, this.selectedTaskId);
      },
      recordButton() {
        return '../resources/' + (!this.selectedTaskState ? 'record' : 'recording') + '.png';
      },
      pauseButton() {
        return '../resources/' + (this.selectedTaskState === bg.S.State.running ? 'pause' : 'play') + '.png';
      }
    },
    methods: {
      createProject() {
        bg.createProject({
          name: app.newProject.name,
        }).then(() => {
          app.projects = _.cloneDeep(bg.projects);
          app.settings = _.cloneDeep(bg.settings);
          app.newProject = {
            isEditorOpened:false,
            name:""
          };
        });
      },
      addTask() {
        if (app.selected)
          bg.P.addTask(app.selected, {
            name:app.newTask.name,
            priority:app.newTask.priority,
            url: (app.newTask.includeURL ? tab.url : "")
          });
        bg.P.ts(app.selected);
        app.newTask = {
          name:"",
          includeURL:false,
          priority:1,
          isEditorOpened:true
        };
      },
      setTaskDone(taskId) {
        bg.P.ts(bg.P.setTaskDone(app.selected, taskId));
      },
      showNewProject() {
        app.newProject.isEditorOpened = true;
        setTimeout(function () { // eww
          $('#txb-project-name').focus();
        }, 100);
      },
      showNewTask() {
        app.newTask.isEditorOpened = true;
        setTimeout(function () { // eww
          $('#txb-task-name').focus();
        }, 100);
      },
      clickRecord() {
        if (!this.selectedTaskState)
          bg.P.start(this.selected, this.selectedTaskId || null);
        else
          bg.P.finish(this.selected, this.selectedTaskId || null);
      },
      clickPause() {
        if (this.selectedTaskState === bg.S.State.running)
          bg.P.pause(this.selected, this.selectedTaskId || null);
        else
          bg.P.start(this.selected, this.selectedTaskId || null);
      },
      openOptions() {
        bg.saveData(app.projects, app.settings)
        .then(() => browser.runtime.openOptionsPage());
      },
      formatDuration(d) {
        return `${d.days()}d ${d.hours()}h ${d.minutes()}m ${d.seconds()}s`;
      },
      open(url) {
        browser.tabs.create({ url });
      }
    }
  });

  window.addEventListener('unload', () => {
    bg.saveData(app.projects, app.settings);
  });

  setInterval(() => {
    app.isTicking && app.$forceUpdate();
  }, 1000);
}, console.error);
