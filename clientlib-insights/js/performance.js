(function (App) {
  const {
    getCurrentPageUrlForApis,
    escapeHTML,
    fetchRawValue,
    getGaugeQualityFromScore,
    updateGaugeIcon,
    initPerformanceGauges,
    toAcronym,
    updatePageSpeedTabLoaders,
    updateCriticalMetrics,
    updateAllCriticalItems
  } = App.helpers;

  const {
    SECTION_MAPPING,
    PAGE_SPEED_KEY_MAP,
    ICON_MAP,
    STATUS_ICON_MAP,
  } = App.constants;

  const overallList = document.getElementById("overall-critical-points");
  const criticalItems = overallList.querySelectorAll("li");
  const loader = document.getElementById("globalLoader");
  const loaderLogo = document.getElementsByClassName('pagespeed-loader');
  const statusWrap = document.querySelectorAll("status");
  const bar = document.querySelectorAll("bar");

  function getFirstAudit(groups) {
    const order = ["contrast", "altText", "labels", "aria", "other"];
    for (const key of order) {
      if (groups[key] && groups[key].length > 0) {
        return groups[key][0];
      }
    }
    return null;
  }

  function getAuditGroups(data) {
    const GROUPS = {
      contrast: [],
      altText: [],
      labels: [],
      aria: [],
      other: [],
    };
    // Group audits by keywords in their IDs

    Object.keys(data).forEach((id) => {
      const audit = data[id];
      if (id.includes("contrast")) GROUPS.contrast.push(audit);
      else if (id.includes("alt")) GROUPS.altText.push(audit);
      else if (id.includes("label")) GROUPS.labels.push(audit);
      else if (id.includes("aria")) GROUPS.aria.push(audit);
      else GROUPS.other.push(audit);
    });

    return GROUPS;
  }

  function getFirstAuditTitle(metrics, scoreKey, invalidValue) {
    const value = getGaugeQualityFromScore(metrics[scoreKey], true);
    if (value === invalidValue) return null;
    const groups = getAuditGroups(metrics.accessibility_audits);
    const firstAudit = getFirstAudit(groups);
    return firstAudit ? firstAudit.title : null;
  }

  function updateAccessibility(desktop, mobile, item) {

    const criticalItem = item.querySelector(".critical-item");
    const shimmer = item.querySelector(".shimmer-card");

    const desktopTitle = getFirstAuditTitle(
      desktop,
      "Accessibility Score",
      "high"
    );
    if (desktopTitle) {
      updateCriticalMetrics(criticalItem, desktopTitle, null, item, "");
      return;
    }
    const mobileTitle = getFirstAuditTitle(
      mobile,
      "Accessibility Score",
      "high"
    );
    if (mobileTitle) {
      updateCriticalMetrics(criticalItem, mobileTitle, null, item, "");
      return;
    }
    updateCriticalMetrics(criticalItem, "", null, item, "none");
  }

 // progress

  function onRetryClick(e) {
    // Hide error UI (defensively check existence)
    const errorBlocks = document.getElementsByClassName("api-error-block");
    if (errorBlocks[0]) errorBlocks[0].classList.add("hidden");
    if (errorBlocks[1]) errorBlocks[1].classList.add("hidden");

    if (loaderLogo[0]) loaderLogo[0].style.display = "flex";
    if (loaderLogo[1]) loaderLogo[1].style.display = "flex";

    // Restart progress bars
    if (window.tickers && tickers[0] && tickers[1]) {
      tickers[0].start();
      tickers[1].start();
    }

    // Trigger fetch again (pass a flag if your function supports it)
    fetchPageSpeedMetrics(true);
  }

  // Attach to all current buttons
  document.querySelectorAll(".retryButton").forEach((btn) => {
    btn.addEventListener("click", onRetryClick);
  });

  function createSecondTickerForElements(statusWrap, bar, totalSeconds = 60) {
    let elapsed = 0;
    let timer = null;
    let isFinishing = false;

    function setProgress(pct) {
      const clamped = Math.max(0, Math.min(100, pct));
      bar.style.width = `${clamped}%`;
      bar.setAttribute('aria-valuenow', String(Math.round(clamped)));
    }

    function show() {
      statusWrap.classList.remove('hidden');
      if (!isFinishing) {
        bar.style.transition = 'width 600ms ease';
      }
      setProgress(0);
    }

    function hide() {
      statusWrap.classList.add('hidden');
      setProgress(0);
    }

    function start() {
      isFinishing = false;
      show();
      elapsed = 0;

      timer = setInterval(() => {
        elapsed += 1;
        const pct = (elapsed / totalSeconds) * 100;
        setProgress(pct);

        if (elapsed >= totalSeconds) {
          stop(false);
          // fire-and-forget is fine, or `await` it from caller if needed
          finish();
        }
      }, 1000);
    }

    function completeSmooth() {
      if (isFinishing) return Promise.resolve();
      isFinishing = true;

      let currentPct = parseFloat(bar.getAttribute('aria-valuenow')) || 0;
      currentPct = Math.max(0, Math.min(100, currentPct));
      const remainingPct = Math.max(0, 100 - currentPct);

      const duration = Math.max(300, 200 + remainingPct * 8);

      bar.style.transition = `width ${duration}ms ease`;
      // force reflow so transition change takes effect
      // eslint-disable-next-line no-unused-expressions
      bar.offsetWidth;

      setProgress(100);

      return new Promise((resolve) => {
        let settled = false;

        const onEnd = (e) => {
          if (settled) return;
          if (e.target !== bar || e.propertyName !== 'width') return;
          settled = true;
          bar.removeEventListener('transitionend', onEnd);
          resolve();
        };

        bar.addEventListener('transitionend', onEnd);

        setTimeout(() => {
          if (settled) return;
          bar.removeEventListener('transitionend', onEnd);
          settled = true;
          resolve();
        }, duration + 200);
      });
    }

    async function finish() {
      stop(false);
      await completeSmooth();
      hide();
      isFinishing = false;
    }

    function stop(resetToZero = true) {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (resetToZero) {
        isFinishing = false;
        bar.style.transition = 'none';
        setProgress(0);
        // eslint-disable-next-line no-unused-expressions
        bar.offsetWidth;
        bar.style.transition = 'width 600ms ease';
        hide();
      }
    }

    return { start, stop, finish, completeSmooth, setProgress };
  }


  const statusWraps = document.querySelectorAll('.status');

  const tickers = Array.from(statusWraps).map((wrap) => {
    const bar = wrap.querySelector('.bar');
      if (!bar) {
      console.warn('Loader wrapper missing .bar child', wrap);
        return null;
      }
      return createSecondTickerForElements(wrap, bar, 60);
    }).filter(Boolean);

  // progress end
  async function fetchPageSpeedMetrics(retrying) {
    // existing global loader behavior
    if (!retrying) {
      if (loader && metricSectionsContainer) {
        loader.style.display = "flex";
        metricSectionsContainer.style.display = "none";
      }
    }

    tickers[0].start();
    tickers[1].start();

    App.state.pageSpeedLoading = true;
    updatePageSpeedTabLoaders();

    const currentUrl = getCurrentPageUrlForApis();

    try {

     if (!retrying) {
        const criticalItem = criticalItems[0].querySelector(".critical-item");
        const shimmer = criticalItems[0].querySelector(".shimmer-card");
        updateCriticalMetrics(criticalItem,"","none",null,null,shimmer,"",);
      }

      const criticalItem1 = criticalItems[1].querySelector(".critical-item");
      const shimmer1 = criticalItems[1].querySelector(".shimmer-card");
      updateCriticalMetrics(criticalItem1, '', "none", null, null, shimmer1, "");

      const criticalItem2 = criticalItems[2].querySelector(".critical-item");
      const shimmer2 = criticalItems[2].querySelector(".shimmer-card");
      updateCriticalMetrics(criticalItem2, '', "none", null, null, shimmer2, "");

//      const response = await fetch(
//        `/bin/pagespeed?url=${encodeURIComponent(currentUrl)}`
//      );

      const response = await (async () => {
        const PSI_API_KEY ="AIzaSyD31yT3THtijQzY69N3Jb5x0CEZH4ITGpE";

        if (!PSI_API_KEY) {
          return new Response("Missing PSI API key", { status: 400 });
        }

        const buildQuery = (strategy) => {
          const params = new URLSearchParams({
            url: currentUrl,
            key: PSI_API_KEY,
            strategy
          });
          // exactly like backend cfg.categories()
          params.append("category", "performance");
          params.append("category", "accessibility");
          return params.toString();
        };

        const fetchPSI = (strategy) =>
          fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${buildQuery(strategy)}`);

        const [deskRes, mobRes] = await Promise.all([
          fetchPSI("desktop"),
          fetchPSI("mobile")
        ]);

        if (!deskRes.ok || !mobRes.ok) {
          const failing = !deskRes.ok ? deskRes : mobRes;
          const text = await failing.text().catch(() => "");
          return new Response(text, { status: failing.status });
        }

        const [deskJson, mobJson] = await Promise.all([
          deskRes.json(),
          mobRes.json()
        ]);

        // --- mapping logic identical to backend OSGI service ----
        const mapLH = (psi) => {
          const lh = psi.lighthouseResult;
          const loadingExp = psi.loadingExperience;

          const audits = lh.audits;

          const out = {};

          // 1) Scores
          const perf = lh.categories.performance.score;
          const acc  = lh.categories.accessibility.score;
          out["Performance Score"] = Math.round(perf * 100);
          out["Accessibility Score"] = Math.round(acc * 100);

          // 2) numeric helper
          const getNumeric = (id) =>
            audits[id] && audits[id].numericValue ? audits[id].numericValue : 0;

          // 3) INP fallback logic EXACTLY like backend:
          const lhINP = getNumeric("interaction-to-next-paint");
          const fieldINP =
            loadingExp?.metrics?.INTERACTION_TO_NEXT_PAINT?.percentile || 0;
          const inp = lhINP > 0 ? lhINP : fieldINP;

          out.fcp = getNumeric("first-contentful-paint");
          out.lcp = getNumeric("largest-contentful-paint");
          out.speedIndex = getNumeric("speed-index");
          out.inp = inp;
          out.cls = getNumeric("cumulative-layout-shift");
          out.tbt = getNumeric("total-blocking-time");
          out.interactive = getNumeric("interactive");

          // 4) Accessibility audits (match backend behaviour)
          const auditRefs =
            lh.categories.accessibility.auditRefs.map((a) => a.id);

          const failed = auditRefs
            .map((id) => audits[id])
            .filter((a) => a && a.score === 0);

          const impactful = new Set([
            "color-contrast",
            "image-alt",
            "label",
            "focusable-controls",
            "duplicate-id",
            "aria-allowed-attr",
            "aria-label"
          ]);

          const selected = {};
          const addAudit = (audit) => {
            const id = audit.id;
            selected[id] = {
              title: audit.title,
              description: audit.description,
              score: audit.score,
              details: audit.details || null
            };
          };

          // first: impactful
          failed.forEach((a) => {
            if (impactful.has(a.id)) addAudit(a);
          });

          // fill until 4
          if (Object.keys(selected).length < 4) {
            failed.forEach((a) => {
              if (!selected[a.id]) {
                addAudit(a);
                if (Object.keys(selected).length >= 4) return;
              }
            });
          }

          out.accessibility_audits = selected;

          return out;
        };

        const payload = {
          desktop: mapLH(deskJson),
          mobile: mapLH(mobJson)
        };

        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      })();

      if (!response.ok) {
        throw new Error(
          `PageSpeed API failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      await tickers[0].finish();
      await tickers[1].finish();

      App.state.desktopMetricsState = data.desktop || {};
      App.state.mobileMetricsState  = data.mobile || {};

      App.state.pageSpeedLoading = false;
      if (App.state.accessibilityLoading === false) {
        updateAllCriticalItems(criticalItems);
      }

       renderMetricsBySection(
        App.state.desktopMetricsState,
        "desktopMetrics",
        SECTION_MAPPING.technical
      );

      const item = criticalItems[1];
      updatelcp(App.state.desktopMetricsState,App.state.mobileMetricsState,item);

      const itemLast = criticalItems[2];
      updateAccessibility(App.state.desktopMetricsState,App.state.mobileMetricsState,itemLast,);

      // Accessibility detail
      renderAccessibilityAudits(
        data.desktop.accessibility_audits,
        "trafficMetricsContainer"
      );
      updatePageSpeedTabLoaders(); // if needed, you can still refresh other UI parts here

      updatePerformanceGauge("desktop");

      const accessibilityWidget = document.querySelector(
        "#accessibilityDetail .performance-score-widget",
      );

      if (
        accessibilityWidget &&
        App.state.desktopMetricsState["Accessibility Score"] !== undefined
      ) {
        const score = App.state.desktopMetricsState["Accessibility Score"];
        accessibilityWidget.dataset.score = score;
        accessibilityWidget.querySelector(".score-value").textContent = score;
        updateGaugeIcon(accessibilityWidget, score);
        initPerformanceGauges();
      }

    } catch (error) {
      const criticalItem = criticalItems[1].querySelector(".critical-item");
      updateCriticalMetrics(criticalItem, '', "none");

      const criticalItem2 = criticalItems[2].querySelector(".critical-item");
      updateCriticalMetrics(criticalItem2, '', "none");

      console.error("PageSpeed fetch failed:", error);

      tickers[0].stop(true);
      tickers[1].stop(true);

      // Hide loader
      loaderLogo[0].style.display = "none";
      loaderLogo[1].style.display = "none";

      // Show error UI
      document.getElementsByClassName("api-error-block")[0].classList.remove("hidden");
      document.getElementsByClassName("api-error-block")[1].classList.remove("hidden");

    } finally {
    }
  }

  function renderAccessibilityAudits(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const groups = getAuditGroups(data);

    function renderGroup(title, audits) {
      if (audits.length === 0) return;
      const section = document.createElement("div");
      section.className = "group-section";
      section.innerHTML = `<span class='group-title'>${title} (${audits.length})</span>`;

      audits.forEach((audit) => {
        const accordion = document.createElement("div");
        accordion.className = "accordion";

        const header = document.createElement("div");
        header.className = "accordion-header";

        const titleSpan = document.createElement("span");
        titleSpan.textContent = audit.title;

        const arrow = document.createElement("span");
        arrow.className = "accordion-arrow";
        arrow.textContent = "+";

        header.appendChild(titleSpan);
        header.appendChild(arrow);

        const content = document.createElement("div");
        content.className = "accordion-content";

        let failingCards = "";
        if (audit.details && audit.details.items) {
          failingCards = audit.details.items
            .map((item) => {
              return `
                <div class="element-card">
                  <h4>${item.node?.selector || "Unknown element"}</h4>
                  ${
                    item.node?.snippet
                      ? `<pre class="search-placeholder">${escapeHTML(
                          item.node.snippet
                        )}</pre>`
                      : ""
                  }
                  ${
                    item.node?.screenshot
                      ? `<img src="${item.node.screenshot}" />`
                      : ""
                  }
                </div>
              `;
            })
            .join("");
        }

        content.innerHTML = `
            ${failingCards}
          `;

        header.addEventListener("click", () => {
          const isOpen = content.classList.contains("open");
          if (isOpen) {
            content.classList.remove("open");
            content.style.maxHeight = null;
            arrow.textContent = "+";
            arrow.classList.remove("open");
          } else {
            content.classList.add("open");
            content.style.maxHeight = content.scrollHeight + "px";
            arrow.textContent = "×";
            arrow.classList.add("open");
          }
        });

        accordion.appendChild(header);
        accordion.appendChild(content);
        section.appendChild(accordion);
      });

      container.appendChild(section);
    }

    renderGroup("Contrast Issues", groups.contrast);
    renderGroup("Alt Text Issues", groups.altText);
    renderGroup("Label Issues", groups.labels);
    renderGroup("ARIA Issues", groups.aria);
    renderGroup("Other Accessibility Issues", groups.other);
  }
    const desktopBtn = document.getElementById("desktopBtn");
    const mobileBtn = document.getElementById("mobileBtn");
  if (desktopBtn && mobileBtn) {
    desktopBtn.setAttribute("aria-selected", "true");
    mobileBtn.setAttribute("aria-selected", "false");

    desktopBtn.addEventListener("click", () => {
      if (desktopBtn.classList.contains("active")) return;

      desktopBtn.classList.add("active");
      mobileBtn.classList.remove("active");
      desktopBtn.setAttribute("aria-selected", "true");
      mobileBtn.setAttribute("aria-selected", "false");

      if (App.state.desktopMetricsState) {
        renderMetricsBySection(
          App.state.desktopMetricsState,
          "desktopMetrics",
          SECTION_MAPPING.technical
        );
        updatePerformanceGauge("desktop");
      }
    });

    mobileBtn.addEventListener("click", () => {
      if (mobileBtn.classList.contains("active")) return;

      mobileBtn.classList.add("active");
      desktopBtn.classList.remove("active");
      mobileBtn.setAttribute("aria-selected", "true");
      desktopBtn.setAttribute("aria-selected", "false");

      if (App.state.mobileMetricsState) {
        renderMetricsBySection(
          App.state.mobileMetricsState,
          "desktopMetrics",
          SECTION_MAPPING.technical
        );
        updatePerformanceGauge("mobile");
      } else {
        const container = document.getElementById("desktopMetrics");
        if (container) {
          container.innerHTML =
            '<p class="placeholder-text">Mobile metrics unavailable.</p>';
        }
      }
    });
  }

  // update Performance gauge for desktop/mobile
  function updatePerformanceGauge(device = "desktop") {
    const widget = document.querySelector(
      "#performanceDetail .performance-score-widget"
    );
    if (!widget) return;

    const source = device === "mobile" ? App.state.mobileMetricsState : App.state.desktopMetricsState;
    if (!source || source["Performance Score"] === undefined) return;

    const score = source["Performance Score"];

    widget.dataset.score = score;
    const valueEl = widget.querySelector(".score-value");
    if (valueEl) valueEl.textContent = score;

    updateGaugeIcon(widget, score);
    initPerformanceGauges();
  }
 function updatelcp(desktopMetricData, mobileMetricData, item) {
    const criticalItem = item.querySelector(".critical-item");
    const shimmer = item.querySelector(".shimmer-card");

    const METRIC_CONFIGS = [
      {
        label: "Largest Contentful Paint",
        key: "lcp",
        device: "desktop",
        data: desktopMetricData,
      },
      {
        label: "Largest Contentful Paint",
        key: "lcp",
        device: "mobile",
        data: mobileMetricData,
      },
      {
        label: "Cumulative Layout Shift",
        key: "cls",
        device: "desktop",
        data: desktopMetricData,
      },
      {
        label: "Cumulative Layout Shift",
        key: "cls",
        device: "mobile",
        data: mobileMetricData,
      },
    ];

    function classifySafe({ label, key, device, data }) {
      const metricKey = PAGE_SPEED_KEY_MAP[label];
      const raw = data[metricKey];
      if (raw == null) return null;
      const score = classifyMetricByKey(label, fetchRawValue(raw, key), device);
      return score.className !== "metric-good"
        ? `${label} ${score.value} in ${device}`
        : null;
    }

    for (const config of METRIC_CONFIGS) {
      const message = classifySafe(config);
      if (message) {
        updateCriticalMetrics(criticalItem, message, null, item, "");
        
        return;
      }
    }
    // If all metrics are good or null, remove the item
    updateCriticalMetrics(criticalItem, "", null, item, "none");
  }

  function renderMetricsBySection(metrics, containerId, metricKeys) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    if (!metrics || Object.keys(metrics).length === 0) {
      container.innerHTML =
        '<p class="placeholder-text" style="color:red;">Metrics data unavailable.</p>';
      return;
    }

    if (containerId === "mobileMetrics" && Object.keys(metrics).length === 0) {
      container.innerHTML =
        '<p class="placeholder-text">Mobile metrics will be loaded here.</p>';
      return;
    }

    const listWrapper = document.createElement("div");
    listWrapper.className = "detail-metrics-grid-engagement";

    metricKeys.forEach((key) => {
      const dataKey = PAGE_SPEED_KEY_MAP[key] || key;
      let rawValue = metrics[dataKey];

      if (rawValue === undefined || rawValue === null) rawValue = 0;

      if (typeof rawValue === "string") {
        const num = Number(rawValue.replace(/,/g, ""));
        if (!isNaN(num)) rawValue = num;
      }

      let formattedValue;
      let numeric = Number(rawValue);

      // format by metric type
      switch (key) {
        case "Largest Contentful Paint":
        case "First Contentful Paint":
        case "Speed Index":
          numeric = numeric / 1000; // ms -> s
          formattedValue = numeric.toFixed(1) + " s";
          break;

        case "Interaction to Next Paint":
          formattedValue = numeric.toFixed(0) + " ms";
          break;

        case "Cumulative Layout Shift":
          formattedValue = numeric.toFixed(2);
          break;

        default:
          formattedValue =
            typeof rawValue === "number" ? rawValue.toLocaleString() : rawValue;
      }

      // classification (Good / Moderate / Poor)
      let classification = null;
      const device =
        mobileBtn && mobileBtn.classList.contains("active")
          ? "mobile"
          : "desktop";

      if (
        [
          "Largest Contentful Paint",
          "First Contentful Paint",
          "Speed Index",
          "Interaction to Next Paint",
          "Cumulative Layout Shift",
        ].includes(key)
      ) {
        classification = classifyMetricByKey(key, numeric, device);
      } else if (key === "Accessibility Score") {
        classification = classifyAccessibilityScore(rawValue);
      }

      const iconUrl =
        ICON_MAP[key] ||
        "https://cdn-icons-png.flaticon.com/512/565/565547.png";

      const row = document.createElement("div");
      row.className = "metric-row";

      row.innerHTML = `
      <div class="metric-left">
        <span class="metric-icon">
          <img src="${iconUrl}" class="page-performance-icon" alt="${key} icon"/>
        </span>
        <span class="metric-label long">${key}</span>
        <span class="metric-label short">${toAcronym(key)}</span>
      </div>

      <div class="metric-middle">
        <span class="metric-value">${formattedValue}</span>
      </div>

      <div class="metric-right">
        ${
          classification
            ? `<span class="metric-rating ${classification.className}">
                 <img
                   src="${STATUS_ICON_MAP[classification.className]}"
                   class="metric-status-icon"
                   alt="${classification.label || ""}"
                 />
               </span>`
            : ""
        }
      </div>
    `;

      listWrapper.appendChild(row);
    });

    container.appendChild(listWrapper);
  }

  function classifyAccessibilityScore(value) {
    const v = Number(value) || 0;
    if (v >= 85) {
      return { label: "Good", className: "metric-good", value: "is good" };
    }
    if (v >= 50) {
      return { label: "Moderate", className: "metric-moderate", value: "is moderate" };
    }
    return { label: "Poor", className: "metric-bad", value: "can be improved" };
  }

  function classifyMetricByKey(key, value, device = "desktop") {
    switch (key) {
      case "Largest Contentful Paint":
        if (value <= 2.5) return { label: "Good", className: "metric-good", value: "is good" };
        if (value <= 4.0)
          return { label: "Needs Improvement", className: "metric-moderate", value: "is moderate" };
        return { label: "Poor", className: "metric-bad", value: "can be improved" };

      case "Interaction to Next Paint":
        if (value <= 200) return { label: "Good", className: "metric-good", value: "is good" };
        if (value <= 500)
          return { label: "Needs Improvement", className: "metric-moderate", value: "is moderate" };
        return { label: "Poor", className: "metric-bad", value: "can be improved" };

      case "Cumulative Layout Shift":
        if (value <= 0.1) return { label: "Good", className: "metric-good", value: "is good" };
        if (value <= 0.25)
          return { label: "Needs Improvement", className: "metric-moderate", value: "is moderate" };
        return { label: "Poor", className: "metric-bad", value: "can be improved" };

      case "First Contentful Paint":
        if (value <= 1.8) return { label: "Good", className: "metric-good", value: "is good" };
        if (value <= 3.0)
          return { label: "Needs Improvement", className: "metric-moderate", value: "is moderate" };
        return { label: "Poor", className: "metric-bad", value: "can be improved" };

      case "Speed Index":
        if (device === "mobile") {
          if (value <= 3.4) return { label: "Good", className: "metric-good", value: "is good" };
          if (value <= 5.8)
            return {
              label: "Needs Improvement",
              className: "metric-moderate", value: "is moderate"
            };
          return { label: "Poor", className: "metric-bad", value: "can be improved" };
        } else {
          if (value <= 1.3) return { label: "Good", className: "metric-good", value: "is good" };
          if (value <= 2.3)
            return {
              label: "Needs Improvement",
              className: "metric-moderate", value: "is moderate"
            };
          return { label: "Poor", className: "metric-bad", value: "can be improved" };
        }

      default:
        return null;
    }
  }

  App.performance = { 
    fetchPageSpeedMetrics, 
    renderMetricsBySection,
    getAuditGroups,
    renderAccessibilityAudits,
};
})((window.App = window.App || {}));
