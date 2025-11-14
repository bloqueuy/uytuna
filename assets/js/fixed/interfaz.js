// HEADER FIXED
function headerInit() {
  var header = document.querySelector(".js-header");
  var triggerElement = document.querySelector(".js-header-limit");
  var isHome = header.classList.contains("is-home");

  // Waypoint para el efecto fixed
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

  // Funcionalidad para ocultar/mostrar header en home
  if (isHome) {
    function handleScroll() {
      if (window.scrollY === 0) {
        header.classList.add("is-hidden");
      } else {
        header.classList.remove("is-hidden");
      }
    }

    // Verificar estado inicial
    handleScroll();

    // Listener de scroll
    window.addEventListener("scroll", handleScroll, { passive: true });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  headerInit();
});