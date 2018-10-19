(function () {
  const params = new URLSearchParams(location.search);
  const name = params.get("name");
  const image = params.get("image");
  const course = params.get("course");
  const video = params.get("video");

  document.querySelector("main").innerHTML = name;
})();
