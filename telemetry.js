(function () {
  const STORAGE_KEY = "clickTelemetry";
  const MAX_EVENTS = 500;

  function safeText(value, maxLength) {
    return (value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
  }

  function getSelector(element) {
    if (!element || !element.tagName) {
      return "";
    }

    if (element.id) {
      return `#${element.id}`;
    }

    const parts = [];
    let node = element;
    let depth = 0;

    while (node && node.nodeType === 1 && depth < 4) {
      let part = node.tagName.toLowerCase();

      if (node.classList && node.classList.length) {
        part += `.${Array.from(node.classList).slice(0, 2).join(".")}`;
      }

      const parent = node.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(function (child) {
          return child.tagName === node.tagName;
        });
        if (siblings.length > 1) {
          part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
        }
      }

      parts.unshift(part);
      node = parent;
      depth += 1;
    }

    return parts.join(" > ");
  }

  function loadEvents() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  }

  function trackClick(event) {
    const target = event.target;
    if (!target || !target.tagName) {
      return;
    }

    const tag = target.tagName.toLowerCase();
    if (tag === "html" || tag === "body") {
      return;
    }

    const record = {
      ts: new Date().toISOString(),
      pageUrl: window.location.href,
      selector: getSelector(target),
      tagName: tag,
      id: target.id || "",
      className: safeText(target.className, 100),
      text: safeText(target.innerText || target.textContent, 120),
      imageSrc: tag === "img" ? (target.currentSrc || target.src || "") : "",
      imageAlt: tag === "img" ? safeText(target.alt, 100) : "",
      x: event.clientX,
      y: event.clientY
    };

    const events = loadEvents();
    events.push(record);
    saveEvents(events);

    if (typeof window.clarity === "function") {
      window.clarity("set", "last_click_selector", record.selector || "unknown");
      window.clarity("set", "last_click_tag", record.tagName);
    }
  }

  document.addEventListener("click", trackClick, true);

  window.appTelemetry = {
    getEvents: function () {
      return loadEvents();
    },
    clearEvents: function () {
      localStorage.removeItem(STORAGE_KEY);
    },
    exportEvents: function () {
      const payload = JSON.stringify(loadEvents(), null, 2);
      console.log("Click telemetry export:", payload);
      return payload;
    }
  };
})();