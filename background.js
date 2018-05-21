var queryEachTab = function(queryInfo, callback) {
  chrome.tabs.query(queryInfo, function(tabs) {
    for(var i = 0; i < tabs.length; i++) {
      callback(tabs[i]);
    }
  });
};

var queryCurrentTab = function(callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      return callback(tabs[0]);
    }
  });
};

var newTab = function(options) {
  chrome.tabs.create(options || {});
};

var windowByOffset = function(windowId, offset, callback) {
  chrome.windows.getAll({windowTypes: ['normal']}, function(windows) {
    for (var i = 0; i < windows.length; i++) {
      if (windows[i].id == windowId) {
        break;
      }
    }
    callback(windows[(windows.length + i + offset) % windows.length]);
  })
};

var tabByOffset = function(tab, offset, callback) {
  chrome.tabs.query({windowId: tab.windowId}, function(tabs) {
    callback(tabs[(tabs.length + tab.index + offset) % tabs.length]);
  })
};

var zooms = [0.25, 0.333, 0.5, 0.666, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];

chrome.browserAction.onClicked.addListener(function(tab) {
  newTab({url: "chrome://extensions/configureCommands"});
});

chrome.commands.onCommand.addListener(function(command) {
  (function () {
    if (command === 'close-tab') {
      queryCurrentTab(function(tab) {
        chrome.tabs.remove(tab.id);
      });
    } else if (command === 'close-window') {
      chrome.windows.getCurrent({}, function(win) {
        chrome.windows.remove(win.id);
      });
    } else if (command === 'focus-tab-previous') {
      queryCurrentTab(function(current) {
        tabByOffset(current, -1, function(tab) {
          chrome.tabs.update(tab.id, {active: true});
        });
      });
    } else if (command === 'focus-tab-next') {
      queryCurrentTab(function(current) {
        tabByOffset(current, 1, function(tab) {
          chrome.tabs.update(tab.id, {active: true});
        });
      });
    } else if (command === 'focus-window-other') {
      chrome.windows.getCurrent({}, function(current) {
        windowByOffset(current.id, 1, function(win) {
          chrome.windows.update(win.id, {focused: true});
        });
      });
    } else if (command === 'new-tab') {
      newTab();
    } else if (command === 'open-downloads') {
      newTab({url: 'chrome://downloads'});
    } else if (command === 'open-extensions') {
      newTab({url: 'chrome://extensions'});
    } else if (command === 'open-history') {
      newTab({url: 'chrome://history'});
    } else if (command === 'open-settings') {
      newTab({url: 'chrome://settings'});
    } else if (command === 'duplicate-tab') {
      queryCurrentTab(function(tab) {
        chrome.tabs.duplicate(tab.id);
      });
    } else if (command === 'move-tab-left') {
      queryCurrentTab(function(tab) {
        chrome.tabs.move(tab.id, {index: tab.index == 0 ? 0 : tab.index-1});
      });
    } else if (command === 'move-tab-right') {
      queryCurrentTab(function(tab) {
        chrome.tabs.move(tab.id, {index: tab.index+1});
      });
    } else if (command === 'move-tab-to-new') {
      queryCurrentTab(function(tab) {
        chrome.windows.create({focused: true, tabId: tab.id}, function(win) {
          chrome.windows.update(win.id, {focused: true});
        });
      });
    } else if (command === 'move-tab-to-other') {
      queryCurrentTab(function(tab) {
        windowByOffset(tab.windowId, -1, function(win) {
          chrome.tabs.move(tab.id, {windowId: win.id, index: -1});
          chrome.windows.update(win.id, {focused: true});
          chrome.tabs.update(tab.id, {active: true});
        });
      });
    } else if (command === 'mute-tab') {
      queryCurrentTab(function(tab) {
        chrome.tabs.update(tab.id, {muted: !tab.mutedInfo.muted});
      });
    } else if (command === 'unmute-tab') {
      queryCurrentTab(function(tab) {
        chrome.tabs.update(tab.id, {muted: false});
      });
    } else if (command === 'mute-tabs-audible') {
      queryEachTab({audible: true}, function(tab) {
        chrome.tabs.update(tab.id, {muted: !tab.mutedInfo.muted});
      });
      queryEachTab({audible: false, mute: true}, function(tab) {
        chrome.tabs.update(tab.id, {muted: false});
      });
    } else if (command === 'pin-tab') {
      queryCurrentTab(function(tab) {
        chrome.tabs.update(tab.id, {pinned: !tab.pinned});
      });
    } else if (command === 'reload-tab') {
      chrome.tabs.reload();
    } else if (command === 'reload-tab-bypassing-cache') {
      chrome.tabs.reload(null, {bypassCache: true})
    } else if (command === 'restore-tab') {
      chrome.sessions.restore(null);
    } else if (command === 'history-back') {
      chrome.tabs.executeScript({
        code: 'window.history.back();',
      });
    } else if (command === 'history-forward') {
      chrome.tabs.executeScript({
        code: 'window.history.forward();',
      });
    } else if (command === 'fullscreen') {
      chrome.windows.getCurrent({}, function(win) {
        if (win.state === "fullscreen" || win.state == "docked") {
          chrome.windows.update(win.id, {state: "normal"});
        } else {
          chrome.windows.update(win.id, {state: "fullscreen"});
        }
      });
    } else if (command === 'new-window') {
      chrome.windows.create({focused: true}, function(win) {
        chrome.windows.update(win.id, {focused: true});
      });
    } else if (command === 'new-window-incognito') {
      chrome.windows.create({focused: true, incognito: true}, function(win) {
        chrome.windows.update(win.id, {focused: true});
      });
    } else if (command === 'zoom-in') {
      queryCurrentTab(function(tab) {
        chrome.tabs.getZoom(tab.id, function(z) {
          for(var i = 0; i < zooms.length; i++) {
            if (zooms[i] > z) {
              chrome.tabs.setZoom(tab.id, zooms[i]);
              break;
            }
          }
        })
      });
    } else if (command === 'zoom-out') {
      queryCurrentTab(function(tab) {
        chrome.tabs.getZoom(tab.id, function(z) {
          for(var i = zooms.length - 1; i >= 0; i--) {
            if (zooms[i] < z) {
              chrome.tabs.setZoom(tab.id, zooms[i]);
              break;
            }
          }
        })
      });
    } else if (command === 'zoom-reset') {
      queryCurrentTab(function(tab) {
        chrome.tabs.setZoom(tab.id, 0);
      });
    } else {
      console.log("Unknown command " + command);
    }
  })();
  return false;
});

var getShortcuts = function(f) {
  var shortcuts = {};
  chrome.runtime.getPlatformInfo(function(pi) {
    var pattern;
    if (pi.os === "mac") {
      pattern = /^Ctrl\+Alt\+(\w)$/;
    } else {
      pattern = /^Alt\+(\w)$/;
    }
    var match;
    chrome.commands.getAll(function (cs) {
      for(var i = 0; i < cs.length; i++) {
        if (match = cs[i].shortcut.match(pattern)) {
          shortcuts[match[1]] = true;
        }
      }
      f(shortcuts);
    });
  });
};

var globalShortcuts = {};
getShortcuts(function(s) { globalShortcuts = s; });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  sendResponse(globalShortcuts);
});
