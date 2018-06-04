var bg;
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
    },
    methods: {
      createProject() {
        bg.createProject({
          name:'Test'+Math.floor(Math.random() * 500)
        }).then(() => {
          app.projects = _.cloneDeep(bg.projects);
          app.settings = _.cloneDeep(bg.settings);
        });
      }
    }
  });

  window.addEventListener('unload', () => {
    bg.saveData(app.projects, app.settings);
  });
}, console.error);
