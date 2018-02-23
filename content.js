var strip = function() {
  chrome.runtime.sendMessage({}, function(shortcuts) {
    var es = document.querySelectorAll('[accesskey]');
    for(var i = 0; i < es.length; i++) {
      if (shortcuts[es[i].accessKey.toUpperCase()]) {
        es[i].accessKey = null;
      }
    }
  });
}
if (document.readyState != 'loading') {
  strip();
} else {
  document.addEventListener('DOMContentLoaded', strip);
}
