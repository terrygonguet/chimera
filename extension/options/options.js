var bg,app;
browser.runtime.getBackgroundPage()
.then(win => {
  bg = win;
  app = new Vue({
    el:'#container',
    data: {
      bg,
      projects: _.cloneDeep(bg.projects),
      settings: _.cloneDeep(bg.settings),
      jsonData:"",
    },
    computed: {
      selected() {
        if (!this.projects[this.settings.selected]) this.settings.selected = null;
        if (!this.settings.selected && _.keys(this.projects).length) 
          this.settings.selected = _.keys(this.projects)[0];
        return this.projects[this.settings.selected];
      },
    },
    methods: {
      createProject() {
        bg.createProject({ name:"Untitled" })
        .then(() => {
          app.projects = _.cloneDeep(bg.projects);
          app.settings = _.cloneDeep(bg.settings);
        });
      },
      removeProject() {
        if (confirm("Do you really want to remove " + this.selected.name + " ?")) {
          delete this.projects[this.selected.id];
          this.saveData()
          .then(() => {
            app.projects = _.cloneDeep(bg.projects);
            app.settings = _.cloneDeep(bg.settings);
          });
        }
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
      deleteTask(taskId) {
        bg.P.removeTask(this.selected, taskId, true);
      },
      createTask() {
        bg.P.addTask(this.selected);
      },
      saveData() {
        return bg.saveData(app.projects, app.settings);
      },
      importData() {
        if (this.jsonData && confirm("This will erase all your current data ! Are you sure ?")) {
          let { projects, settings } = JSON.parse(this.jsonData);
          bg.saveData(projects, settings)
          .then(() => {
            app.projects = _.cloneDeep(bg.projects);
            app.settings = _.cloneDeep(bg.settings);
          });
        } else {
          this.jsonData = "Place data here";
        }
      },
      exportData() {
        this.jsonData = JSON.stringify({
          projects: this.projects,
          settings: this.settings
        }, null, 2);
      },
    }
  });
}, console.error);
