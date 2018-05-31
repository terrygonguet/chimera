var settings, projects;

// get data or defaults
browser.storage.sync.get()
.then(data => {
  settings = data.settings || {
    default_priority:1,
    default_increase:1,
    include_URL_with_selection: true,
    default_tick_every: { days:1 },
  };
  projects = _.omit(data, 'settings');
  test();
});

function saveData() {
  return browser.storage.set(Object.assign({ settings }, projects));
}

function test() {
  let p = Project.create({
    name:'Test',
    description: 'lol',
    default_increase: settings.default_increase,
    default_priority: settings.default_priority,
    tick_every: settings.default_tick_every
  });
  Project.addTask(p, {
    name:'test2'
  });
  Project.start(p);
  Project.pause(p);
  Project.start(p);
  Project.finish(p);
  console.log(p);
}

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
