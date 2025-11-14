// HEADER FIXED
function headerInit() {
  var header = document.querySelector(".js-header");
  var triggerElement = document.querySelector(".js-header-limit");

  new Waypoint({
    element: triggerElement,
    handler: function (direction) {
      if (direction === "down") {
        header.classList.add("is-fixed");
      } else {
        header.classList.remove("is-fixed");
      }
    },
    offset: 0,
  });
}

window.addEventListener("DOMContentLoaded", () => {
  headerInit();
});