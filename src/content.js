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

// Inject iframe
const iframe = document.createElement("iframe");
iframe.classList.add("hackday");
iframe.src = chrome.runtime.getURL("iframe/index.html?" + queryString);
document.body.querySelector("main").appendChild(iframe);
