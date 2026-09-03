// state.js

window.App = window.App || {};
App.state = {
  accessibilityLoading: false,
  pageSpeedLoading: false,
  desktopMetricsState: null,
  mobileMetricsState: null,

  
  // NEW: analytics cache by (mode|start|end)
  analyticsCache: Object.create(null), // { [key: string]: metricsObject }
  lastRenderedKey: null 

};