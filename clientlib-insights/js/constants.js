// constants.js
(function (App) {
  // Analytics keys
  const PAGE_ANALYTICS_KEYS = [
    "Page Views",
    "Visitors",
    "Visits",
    "Entries",
    "Exits",
    "Bounces",
  ];

  //   Section Mapping
  const SECTION_MAPPING = {
    userBehaviour: PAGE_ANALYTICS_KEYS,
    technical: [
      "Largest Contentful Paint",
      "Interaction to Next Paint",
      "Cumulative Layout Shift",
      "First Contentful Paint",
      "Speed Index",
    ],
    traffic: ["Accessibility Score"],
  };

  //   Page speed key map
  const PAGE_SPEED_KEY_MAP = {
    "Largest Contentful Paint": "lcp",
    "First Contentful Paint": "fcp",
    "Speed Index": "speedIndex",
    "Interaction to Next Paint": "inp",
    "Cumulative Layout Shift": "cls",
  };

  //   Quality icons
  const QUALITY_ICONS = {
    high: {
      src: "/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/High-green.svg",
      alt: "High",
    },
    moderate: {
      src: "/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/Moderate.svg",
      alt: "Moderate",
    },
    low: {
      src: "/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/Low-red.svg",
      alt: "Low",
    },
  };

  //   icon mappings
  const ICON_MAP = {
    "Performance Score":
      "/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/desktop-traffic.png",
    "Accessibility Score":
      "/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/page-views.png",
    "First Contentful Paint": "/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/first-contentful-paint.svg",
    "Largest Contentful Paint": "/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/largest-contentful-paint.svg",
    "Speed Index": "/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/performance-metrics.svg",
    "Interaction to Next Paint": "/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/time-to-interactive.svg",
    "Cumulative Layout Shift": "/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/total-visits.svg",
  };

  // Good / Moderate / Poor icon mapping
  const STATUS_ICON_MAP = {
    "metric-good": "/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/Good.svg",
    "metric-moderate": "/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/Moderate.svg",
    "metric-bad": "/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/Poor.svg",
  };

  App.constants = {
    PAGE_ANALYTICS_KEYS,
    SECTION_MAPPING,
    PAGE_SPEED_KEY_MAP,
    QUALITY_ICONS,
    ICON_MAP,
    STATUS_ICON_MAP,
  };
})((window.App = window.App || {}));
