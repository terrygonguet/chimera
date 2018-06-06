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
      selectedTask: null,
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
        return this.projects[this.settings.selected];
      }
    },
    methods: {
      createProject() {
        bg.createProject({
          name: app.newProject.name,
        }).then(() => {
          app.projects = _.cloneDeep(bg.projects);
          app.settings = _.cloneDeep(bg.settings);
          app.newProject.isEditorOpened = false;
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
      },
      setTaskDone(taskId) {
        bg.P.ts(bg.P.setTaskDone(app.selected, taskId));
      },
    }
  });

  window.addEventListener('unload', () => {
    bg.saveData(app.projects, app.settings);
  });
}, console.error);
