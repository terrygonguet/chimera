var bg;
browser.runtime.getBackgroundPage()
.then(win => { bg = win; }, console.error);
