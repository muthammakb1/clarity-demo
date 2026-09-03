/* ---------- CTA collapse on scroll ---------- */

(function (App) {

  const {
    initPerformanceGauges,
    updatePageSpeedTabLoaders
  } = App.helpers;

  const {
    initAccessibilityToggle,
  } = App.accessibility;

  const {
    fetchAnalyticsMetrics,
  } = App.analytics;

  const {
    fetchPageSpeedMetrics,
  } = App.performance;


  const { fetchSeoMetrics } = App.seo || {};

  // document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("metricsSidebar");
  const openBtn = document.getElementById("showMetricsBtn");
  const closeBtn = document.getElementById("closeBtn");
  const loader = document.getElementById("globalLoader");
  const desktopBtn = document.getElementById("desktopBtn");
  const mobileBtn = document.getElementById("mobileBtn");
  const metricSectionsContainer = document.getElementById(
    "metricSectionsContainer"
  );
  const overviewScreen = document.getElementById("metricsOverview");
  const detailScreens = document.querySelectorAll(".metric-detail");
  const backButtons = document.querySelectorAll(".detail-collapse-btn");
  const metricHeaders = document.querySelectorAll(".metric-card");
  const headerLogo = document.querySelector(".header-left");
  const headerBackBtn = document.getElementById("headerBackBtn");
  const sidebarHeader = document.querySelector(".sidebar-header");
  const anyOverallBtn = document.getElementById("overall-btn");
   const anyOrganicBtn = document.getElementById("organic-btn");


  let pageSpeedCalledOnce = false;
  let analyticsCalledOnce = false;
  let seoCalledOnce = false;   // ✅ NEW

  const showOverview = () => {
    if (overviewScreen) overviewScreen.style.display = "flex";
    detailScreens.forEach((d) => {
      d.classList.remove("active");
      d.scrollTop = 0;
    });

    if (headerLogo) headerLogo.style.display = "flex";
    if (headerBackBtn) headerBackBtn.style.display = "none";
    if (sidebarHeader) sidebarHeader.classList.remove("has-back");

    updatePageSpeedTabLoaders();
  };

  const showDetail = (detailId) => {
    if (overviewScreen) overviewScreen.style.display = "none";
    detailScreens.forEach((d) => {
      d.classList.toggle("active", d.id === detailId);
      if (d.id === detailId) d.scrollTop = 0;
    });

    if (headerLogo) headerLogo.style.display = "none";
    if (headerBackBtn) headerBackBtn.style.display = "inline-flex";
    if (sidebarHeader) sidebarHeader.classList.add("has-back");

    updatePageSpeedTabLoaders();
  };

  const collapseAllMetrics = () => {
    showOverview();
  };

  const organicToggle = () => {

    if (!anyOrganicBtn.classList.contains('active')) {
      fetchAnalyticsMetrics(true);
      anyOverallBtn.classList.remove('active')
      anyOrganicBtn.classList.add('active')
    }
  }

 const overallToggle = () => {
if(!anyOverallBtn.classList.contains('active')) {
  fetchAnalyticsMetrics(false);
  anyOrganicBtn.classList.remove('active')
  anyOverallBtn.classList.add('active')
}
 } 
  const openSidebar = () => {
    collapseAllMetrics();
    sidebar.classList.add("open");

    if (!pageSpeedCalledOnce) {
      pageSpeedCalledOnce = true;
      fetchPageSpeedMetrics(false);
    }

    if (!analyticsCalledOnce) {
      analyticsCalledOnce = true;
      fetchAnalyticsMetrics(false);
    }
  };

  const closeSidebar = () => {
    collapseAllMetrics();
    sidebar.classList.remove("open");
  };

  // const toggleMetricSection = (header) => {
  //   const card = header.closest(".metric-card");
  //   if (!card) return;
  //   const detailId = card.getAttribute("data-detail");
  //   if (detailId) showDetail(detailId);
  // };

  const toggleMetricSection = (header) => {
    const card = header.closest(".metric-card");
    if (!card) return;

    const detailId = card.getAttribute("data-detail");

    if (detailId) {
      showDetail(detailId);

      //RUN ONLY FOR SEO AFTER UI SHOWN
      if (detailId === "seoDetail") {

        //WAIT ONE FRAME (instead of random timeout)
        requestAnimationFrame(() => {

          console.log("SEO INIT");

          if (window.App && App.seo) {
            App.seo.init();
          } else {
            console.error("App.seo missing");
          }

        });
      }
    }
  };

  

  if (openBtn) openBtn.addEventListener("click", openSidebar);
  if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
  if(anyOrganicBtn) anyOrganicBtn.addEventListener("click" , organicToggle);
  if(anyOverallBtn) anyOverallBtn.addEventListener("click" , overallToggle);
  if (headerBackBtn) {
    headerBackBtn.addEventListener("click", () => {
      collapseAllMetrics();
    });
  }

  metricHeaders.forEach((header) =>
    header.addEventListener("click", () => toggleMetricSection(header))
  );

  backButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      collapseAllMetrics();
    })
  );

  // Initial state
  collapseAllMetrics();
  if (loader) loader.style.display = "none";
  initPerformanceGauges();
  initAccessibilityToggle();
  // });
  const cta = document.getElementById("showMetricsBtn");
  if (!cta) return;

  let collapsed = false;

  window.addEventListener("scroll", () => {
    if (!collapsed && window.scrollY > 0) {
      cta.classList.add("is-collapsed");
      collapsed = true;
    }
  });
})((window.App = window.App || {}));
