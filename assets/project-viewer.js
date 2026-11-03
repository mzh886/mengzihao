/* =========================================================
   3D PROJECT VIEWER
   A full-screen iframe stage shared by the two project cards.
   Progressive enhancement: without JS every card remains a link.
   ========================================================= */
(function () {
  "use strict";

  var viewer = document.getElementById("projectViewer");
  var frame = document.getElementById("projectViewerFrame");
  var titleNode = document.getElementById("projectViewerTitle");
  var kickerNode = document.getElementById("projectViewerKicker");
  var openLink = document.getElementById("projectViewerOpen");
  var closeButton = viewer ? viewer.querySelector("button[data-project-close]") : null;
  if (!viewer || !frame || !titleNode || !openLink) return;

  var lastFocus = null;
  var isOpen = false;
  var clearTimer = 0;

  function textOf(element, selector) {
    var node = element.querySelector(selector);
    return node ? node.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function openProject(link) {
    if (!link) return;
    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#") return;

    var title =
      link.dataset.projectTitle ||
      textOf(link, ".feature-title") ||
      textOf(link, ".series-row-title") ||
      "3D 项目";
    var kicker =
      link.dataset.projectKicker ||
      textOf(link, ".series-row-kicker") ||
      "3D ARCHIVE / LIVE";

    lastFocus = link instanceof HTMLElement ? link : document.activeElement;
    window.clearTimeout(clearTimer);
    titleNode.textContent = title;
    if (kickerNode) kickerNode.textContent = kicker;
    openLink.href = href;
    frame.title = title;
    frame.src = href;
    viewer.classList.add("is-open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-open");
    isOpen = true;
    if (closeButton instanceof HTMLElement) closeButton.focus({ preventScroll: true });
  }

  function closeProject() {
    if (!isOpen) return;
    isOpen = false;
    viewer.classList.remove("is-open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("project-open");
    frame.src = "about:blank";
    if (lastFocus instanceof HTMLElement && lastFocus.isConnected) {
      lastFocus.focus({ preventScroll: true });
      window.clearTimeout(clearTimer);
      clearTimer = window.setTimeout(function () {
        if (!isOpen && lastFocus instanceof HTMLElement && lastFocus.isConnected) {
          lastFocus.focus({ preventScroll: true });
        }
      }, 80);
    }
  }

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    if (!(event.target instanceof Element)) return;
    var link = event.target.closest("[data-project], .series-row[href], .pagoda-feature[href]");
    if (!link) return;
    if (!link.closest("main")) return;
    event.preventDefault();
    openProject(link);
  });

  viewer.querySelectorAll("[data-project-close]").forEach(function (button) {
    button.addEventListener("click", closeProject);
  });

  document.addEventListener(
    "keydown",
    function (event) {
      if (!isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeProject();
        return;
      }
      if (event.key === "Tab") {
        var focusables = [closeButton, openLink].filter(function (element) {
          return element && element.offsetParent !== null;
        });
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
})();
