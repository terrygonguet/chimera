import _ from 'lodash';

var settings, projects;

// get settings or defaults
browser.storage.sync.get({
  settings: {
    default_priority:1,
    default_increase:1,
    include_URL_with_selection: true,
    default_tick_every: { days:1 },
  }
})
.then(data => {
  settings = data;
  return browser.storage.sync.get();
})
.then(data => {
  projects = _.omit(data, 'settings');
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
