let data = {
  name: undefined,
  image: undefined,
  course: undefined,
  video: undefined
};

// Get user's name and image from "Me" on the top menu
const me = document.querySelector("button[data-control-name=view_me] img");
if (me) {
  data.name = me.alt;
  data.image = me.src;
}

// Get current course and video name from URL path
const matches = location.pathname.match(/^\/learning\/([^\/]+)(?:\/([^\/]+))?$/);
if (matches) {
  data.course = matches[1];
  data.video = matches[2];
}

const queryString = Object.entries(data).map(([k, v]) => {
  return k + "=" + encodeURIComponent(v);
}).join("&");

// Hijack "Notes" tab
const tab = document.querySelector("artdeco-tab.course-body__info-tab-name-notes");
tab.innerText = "Study Group";
// Move "Study Group" tab to be the second
const firstTab = document.querySelector("artdeco-tabs.course-body__info-tabs artdeco-tab:nth-of-type(1)");
firstTab.parentNode.insertBefore(tab, firstTab.nextSibling);
// Inject iframe
const tabPanel = document.querySelector("artdeco-tabpanel div.learning_course_notes");
const iframe = document.createElement("iframe");
iframe.classList.add("hackday");
iframe.src = chrome.runtime.getURL("iframe/index.html?" + queryString);
tabPanel.appendChild(iframe);

// Set listeners
window.onmessage = function(e) {
  switch (e.data) {
    case "start":
      const playBtn = document.querySelector(".video-player__toolbar-menu button.ssplayer-play-button");
      playBtn.click();
      const durationEl = document.querySelector(".ssplayer-time-display-duration");
      if (durationEl) {
        const duration = durationEl.textContent.trim();
        iframe.contentWindow.postMessage({ type: "duration", duration }, "*");
      }
      break;
    case "complete":
      const pauseBtn = document.querySelector(".video-player__toolbar-menu button.ssplayer-pause-button");
      pauseBtn.click();
      break;
  }
};
