var settings, projects;

// get data or defaults
browser.storage.sync.get()
.then(data => {
  settings = data.settings || {
    default_priority:1,
    default_increase:1,
    include_URL_with_selection: true,
    default_tick_every: { days:1 },
    selected: null,
  };
  projects = data.projects || {};
});

function saveData(newProjects, newSettings) {
  let data = { projects, settings };
  if (newProjects) {
    data.projects = JSON.parse(JSON.stringify(newProjects)); // ewwww
    projects = data.projects;
  }
  if (newProjects) {
    data.settings = JSON.parse(JSON.stringify(newSettings)); // ewwww
    settings = data.settings;
  }
  return browser.storage.sync.set(data);
}

function createProject(props={}) {
  let project = Project.create(
    Object.assign({
      default_increase: settings.default_increase,
      default_priority: settings.default_priority,
      tick_every: settings.default_tick_every
    }, props)
  );
  projects[project.id] = project;
  if (!settings.selected) settings.selected = project.id;
  return saveData();
}

Object.defineProperty(window, 'selected', {
  get() {
    return projects[settings.selected];
  },
  set(value) {
    settings.selected = (typeof value === 'string' ? value : value.id);
  }
});

// browser.contextMenus.create({
//   id: "add-link",
//   title: "Add to TODO list",
//   onclick(e, tab) {
//     List.addItem(window.selected, { name:e.linkText, url:e.linkUrl });
//   },
//   contexts: ["link"]
// });
// browser.contextMenus.create({
//   id: "add-page",
//   title: "Add page to TODO list",
//   onclick(e, tab) {
//     List.addItem(window.selected, { name:tab.title, url:e.pageUrl });
//   },
//   contexts: ["page"]
// });
// browser.contextMenus.create({
//   id: "add-selection",
//   title: "Add selection to TODO list",
//   onclick(e, tab) {
//     List.addItem(window.selected, { name:e.selectionText, url: _data.settings.include_URL_with_selection ? e.pageUrl : '' });
//   },
//   contexts: ["selection"]
// });
