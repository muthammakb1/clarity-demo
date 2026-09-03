function renderSidebar(rootEl, handlers = {}) {
  // Load CSS
  function loadCSS(href) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  // Load JS
  function loadJS(src) {
    const script = document.createElement("script");
    script.src = src;
    script.type = "text/javascript";
    document.body.appendChild(script);
  }

  // ---- Load all your assets ----
  setTimeout(function () {
    // Your AEM Clientlib CSS
    loadCSS("/etc.clientlibs/pageInsights/clientlibs/clientlib-insights.css");

    // Your AEM Clientlib JS
    loadJS("/etc.clientlibs/pageInsights/clientlibs/clientlib-insights.js?" + Date.now());
  }, 500);
  if (!rootEl) throw new Error('renderSidebar: rootEl is required');
  rootEl.innerHTML = `
      <div class="main-content">
          <button
            id="showMetricsBtn"
            class="cta-card"
            role="button"
            aria-label="Open Page Insights">
            <div class="cta-text">
              <h4>Page Insights</h4>
            </div>
            <div class="cta-media">
              <img
                src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/page-insight-icon.png"
                alt="icon"
                class="page-insights-logo"
              />
            </div>
          </button>
        </div>
      <div id="metricsSidebar" class="sidebar">
          <div class="sidebar-inner">
            <div class="sidebar-header">
              <div class="header-left">
                <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/kpmg-logo.svg" class="logo-img" alt="KPMG logo" />
                <div class="header-text">
                  <div class="brand-subtitle">Page Performance</div>
                </div>
              </div>

              <div class="header-right">
                <button id="headerBackBtn" class="header-back-btn" type="button">
                  <span><img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/back-icon.svg" class="back-icon" /></span>
                  Back
                </button>
                <button id="closeBtn" class="close-btn" type="button">
                  ×
                </button>
              </div>
            </div>
            <!-- dummy class -->
            <!-- <div class="ccforms"></div>
            <div class="faq-list-container"></div>
            <div class="video-elem__thumbnail-img"></div>
            <div class="resource-list-container"></div> -->

            <div id="globalLoader" class="loader-container">
              <img id="customLoaderImage"
                src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/GIFImage.gif"
                alt="Loading spinner" class="custom-loader-image" />
            </div>

            <div id="metricSectionsContainer" class="metricSectionsContainer">
              <!-- OVERVIEW SCREEN -->
              <div id="metricsOverview" class="metrics-overview">
                <div class="overall-status-card">
                  <div class="overall-left">
                    <div>
                      <img class="critical-icon" src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/needs-Improvement.svg" />
                    </div>
                    <div>
                      <div class="overall-title">
                        <span class="overall-title-highlight">Critical Metrics</span>
                      </div>
                      <ul class="overall-list" id="overall-critical-points">
                        <li>
                          <div class="shimmer-card"></div>
                          <div class="critical-item" style="display:none"></div>
                        </li>
                        <li>
                          <div class="shimmer-card"></div>
                          <div class="critical-item" style="display:none"></div>
                        </li>
                        <li>
                          <div class="shimmer-card"></div>
                          <div class="critical-item" style="display:none"></div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div class="overall-right">
                    <span class="status-pill status-pill--warning">Needs Improvement</span>
                  </div>
                </div>

                <div class="metric-card-grid">
                  <!-- Page Analytics card -->
                  <div class="metric-card metric-card--analytics" data-detail="pageAnalyticsDetail">
                    <div class="metric-header">
                      <div class="metric-card-main">
                        <div class="metric-card-left">
                          <div class="metric-icon-box">
                            <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/page-analytics.svg" alt="Page Analytics" />
                          </div>
                          <div>
                            <div class="metric-card-title">Page Analytics</div>
                          </div>
                        </div>
                        <div class="metric-card-arrow">
                          <img class="metric-card-arrow-image" src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/arrow.svg" alt="Open" />
                        </div>
                      </div>

                      <hr class="metric-divider" />

                      <div class="metric-card-footer">
                        <span class="metric-card-caption">
                          Traffic, Bounce, Conversion
                        </span>

                      </div>
                    </div>
                  </div>

                  <!-- Performance Metrics card -->
                  <div class="metric-card metric-card--performance" data-detail="performanceDetail">
                    <div class="metric-header">
                      <div class="metric-card-main">
                        <div class="metric-card-left">
                          <div class="metric-icon-box">
                            <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/performance-metrics.svg" alt="Performance Metrics" />
                          </div>
                          <div>
                            <div class="metric-card-title">
                              Performance Metrics
                            </div>
                          </div>
                        </div>
                        <div class="metric-card-arrow">
                          <img class="metric-card-arrow-image" src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/arrow.svg" alt="Open" />
                        </div>
                      </div>

                      <hr class="metric-divider" />

                      <div class="metric-card-footer">
                        <span class="metric-card-caption">Core Web Vitals</span>

                      </div>
                    </div>
                  </div>

                  <!-- Accessibility card -->
                  <div class="metric-card metric-card--accessibility" data-detail="accessibilityDetail">
                    <div class="metric-header">
                      <div class="metric-card-main">
                        <div class="metric-card-left">
                          <div class="metric-icon-box">
                            <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/accessibility-compliance.svg" alt="Accessibility Compliance" />
                          </div>
                          <div>
                            <div class="metric-card-title">
                              Accessibility Compliance
                            </div>
                          </div>
                        </div>
                        <div class="metric-card-arrow">
                          <img class="metric-card-arrow-image" src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/arrow.svg" alt="Open" />
                        </div>
                      </div>

                      <hr class="metric-divider" />

                      <div class="metric-card-footer">
                        <span class="metric-card-caption">WCAG Guidelines</span>

                      </div>
                    </div>
                  </div>

                  <!-- SEO Insights card -->
                  <div class="metric-card metric-card--seo" data-detail="seoDetail">
                    <div class="metric-header">
                      <div class="metric-card-main">

                        <div class="metric-card-left">
                          <div class="metric-icon-box">
                            <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M10 2a8 8 0 015.292 13.708l4 4-1.414 1.414-4-4A8 8 0 1110 2zm0 2a6 6 0 100 12 6 6 0 000-12z"/>
                            </svg>
                          </div>

                          <div>
                            <div class="metric-card-title">SEO Insights</div>
                          </div>
                        </div>

                        <div class="metric-card-arrow">
                          <img
                            class="metric-card-arrow-image"
                            src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/arrow.svg"
                            alt="Open"
                          />
                        </div>

                      </div>

                      <hr class="metric-divider" />

                      <div class="metric-card-footer">
                        <span class="metric-card-caption">
                          Rankings, Traffic, CTR
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              

              <!-- PAGE ANALYTICS DETAIL -->
              <div id="pageAnalyticsDetail" class="metric-detail">
                <div class="detail-header">
                  <div class="detail-header-left">
                    <div class="metric-icon-box">
                      <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/page-analytics.svg" alt="Page Analytics" />
                    </div>
                    <div>
                      <div class="detail-title">Page Analytics</div>
                      <div class="detail-subtitle">
                        Traffic, Bounce, Conversion
                      </div>
                    </div>
                  </div>
                  <div class="detail-header-right">
                    <div class="detail-date-range">
                      <input type="text" id="dateRangeInput" name="daterange" class="date-range-input" readonly />
                    </div>
                  </div>
                </div>

                <div class = "analytics-toggle">
                <button id = "overall-btn" class = "toggle-btn overlall-toggle-btn active">Overall</button>
                <button id = "organic-btn" class = "toggle-btn organic-toggle-btn">Organic</button>
                </div>
                <!-- detail-body (updated with IDs + icons) -->
                <div class="detail-body">
                  <section class="detail-section">
                    <div class="traffic-volume-section">
                      <h3>Traffic Volume</h3>

                      <div class="tv-cards">
                        <!-- Total Visits -->
                        <article class="tv-card" aria-label="Total Visits card">
                          <div class="tv-card__icon" aria-hidden="true">
                            <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/total-visits.svg" alt="image" />
                          </div>
                          <div class="tv-card__content">
                            <div class="tv-card__title">
                              Total Visits
                              <span id="totalVisitsValue" class="tv-card__value">--</span>
                            </div>
                          </div>
                        </article>

                        <!-- Unique Visit -->
                        <article class="tv-card" aria-label="Unique Visit card">
                          <div class="tv-card__icon" aria-hidden="true">
                            <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/unique-visits.svg" alt="image" />
                          </div>
                          <div class="tv-card__content">
                            <div class="tv-card__title">
                              Unique Visit
                              <span id="uniqueVisitsValue" class="tv-card__value">--</span>
                            </div>
                          </div>
                        </article>
                      </div>
                    </div>
                  </section>

                  <section class="detail-section detail-section--engagement">
                    <h3>Engagement Quality</h3>

                    <div class="detail-metrics-grid-engagement">

                      <!-- Form Start -->
                      <div class="metric-row metric-form-start">
                        <div class="metric-left">
                          <span class="metric-icon">
                            <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/form-start.svg" alt="Form Start" />
                          </span>
                          <span class="metric-label">Form Start</span>
                        </div>
                        <div class="metric-right">
                          <div class="metric-right-group">
                            <span class="metric-divider" aria-hidden="true"></span>
                            <span id="formStartValue" class="metric-value">--</span>
                          </div>
                        </div>
                      </div>

                      <!-- Form Submit -->
                      <div class="metric-row metric-form-submit">
                        <div class="metric-left">
                          <span class="metric-icon">
                            <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/form-submit.svg" alt="Form Submit" />
                          </span>
                          <span class="metric-label">Form Submit</span>
                        </div>
                        <div class="metric-right">
                          <div class="metric-right-group">
                            <span class="metric-divider" aria-hidden="true"></span>
                            <span id="formSubmitValue" class="metric-value">--</span>
                          </div>
                        </div>
                      </div>

                      <!-- Bounce Rate -->
                      <div class="metric-row metric-bounce">
                        <div class="metric-left">
                          <span class="metric-icon">
                            <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/bounce-rate.svg" alt="image" />
                          </span>
                          <span class="metric-label">Bounce Rate</span>
                        </div>
                        <div class="metric-right">
                          <div class="metric-right-group">
                            <span class="metric-divider" aria-hidden="true"></span>
                            <span id="bounceRateValue" class="metric-value">--</span>
                          </div>
                        </div>
                      </div>

                      <!-- Conversion Rate -->
                      <div class="metric-row metric-conversion">
                        <div class="metric-left">
                          <span class="metric-icon">
                            <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/convertion-rate.svg" alt="image" />
                          </span>
                          <span class="metric-label">Conversion Rate</span>
                        </div>
                        <div class="metric-right">
                          <div class="metric-right-group">
                            <span class="metric-divider" aria-hidden="true"></span>
                            <span id="conversionRateValue" class="metric-value">--</span>
                          </div>
                        </div>
                      </div>

                      <!-- Average Time spent -->
                      <div class="metric-row metric-average-time-spent">
                        <div class="metric-left">
                          <span class="metric-icon">
                            <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/avg-time-spent.svg" alt="image" />
                          </span>
                          <span class="metric-label">Average Time spent</span>
                        </div>
                        <div class="metric-right">
                          <div class="metric-right-group">
                            <span class="metric-divider" aria-hidden="true"></span>
                            <span id="averageTimeSpentValue" class="metric-value">--</span>
                          </div>
                        </div>
                      </div>

                      <!-- FAQ's Clicked -->
                      <div class="metric-row metric-faq-clicked">
                        <div class="metric-left">
                          <span class="metric-icon">
                            <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/form-submit.svg" alt="image" />
                          </span>
                          <span class="metric-label">FAQ's Clicked</span>
                        </div>
                        <div class="metric-right">
                          <div class="metric-right-group">
                            <span class="metric-divider" aria-hidden="true"></span>
                            <span id="faqClicked" class="metric-value">0</span>
                          </div>
                        </div>
                      </div>

                      <!-- Video's Played -->
                      <div class="metric-row metric-video-played" id="video-section">
                        <div class="metric-left">
                          <span class="metric-icon">
                            <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/form-start.svg" alt="image" />
                          </span>
                          <span class="metric-label">Video's Played</span>
                        </div>
                        <div class="metric-right">
                          <div class="metric-right-group">
                            <span class="metric-divider" aria-hidden="true"></span>
                            <span id="videoPlayed" class="metric-value">0</span>
                          </div>
                        </div>
                      </div>

                      <!-- PDF's Downloaded -->

                        <!-- <div class="group-section metric-grid metric-pdf-downloaded" id="pdf-section">
                          <div class="accordion">
                            <div class="accordion-header">
                              <div class="metric-row ">
                              <div class="metric-left">
                                <span class="metric-icon">
                                  <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/pdf_download.svg" alt="image" />
                                </span>
                                <span class="metric-label">PDF's Downloaded</span>
                              </div>
                              <div class="metric-right">
                                <div class="metric-right-group">
                                  <span class="metric-divider" aria-hidden="true"></span>
                                  <span class="pdf-val-cont"><span id="pdfdownloaded" class="metric-value">0</span><span class="accordion-arrow"></span></span>
                                </div>
                              </div> </div>
                            </div>
                            <div class="accordion-content">
                              <div id="pdf-element-card" class="element-card">
                              </div>
                            </div>
                          </div>
                        </div> -->

                        <div class="metric-row metric-pdf-downloaded" id="pdf-section">
                          <div class="metric-left">
                            <span class="metric-icon">
                              <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/pdf_download.svg" alt="image" />
                            </span>
                            <span class="metric-label">PDF's Downloaded</span>
                          </div>
                          <div class="metric-right">
                            <div class="metric-right-group">
                              <span class="metric-divider" aria-hidden="true"></span>
                              <span id="pdfdownloaded" class="metric-value">0</span>
                            </div>
                          </div>
                        </div>
                    </div>
                  </section>

                  <section class="detail-section detail-section--two-column">
                    <div class="device-distribution">
                      <h3>Device-wise Traffic Distribution</h3>
                      <div class="detail-metrics-grid-two-column">
                        <div class="metric-row">
                          <span class="metric-icon">
                            <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/mobile-visit.svg" alt="Mobile visits icon" />
                          </span>
                          <span class="metric-label">Mobile Visits</span>
                          <span class="metric-value" id="mobileVisitsPercent">--</span>
                        </div>
                        <div class="metric-row">
                          <span class="metric-icon">
                            <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/non-mobile-visit.svg" alt="Non-mobile visits icon" />
                          </span>
                          <span class="metric-label">Non Mobile Visits</span>
                          <span class="metric-value" id="nonMobileVisitsPercent">--</span>
                        </div>
                      </div>
                    </div>

                    <!-- <div class="behaviour-context">
          <h3>Behaviour Context</h3>
          <div class="detail-metrics-grid">
            <div class="metric-box metric-box--static metric-box--large">
              <div class="metric-box-header">
                <img
                  src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/peak-traffic-by-hour.svg"
                  class="peak-traff"
                  alt="Peak traffic by hour icon"
                />
                <div class="peak-traffic-by-hr-wrapper">
                  <span class="metric-label">Peak Traffic By Hour</span>
                  <span class="metric-value" id="peakTrafficHourValue">--</span>
                </div>
              </div>
            </div>
          </div>
        </div> -->
                  </section>
                </div>
              </div>
              
                          <!-- SEO DETAIL -->
            <div id="seoDetail" class="metric-detail">
      <div class="seo-insights-panel">

        <!-- Header -->
        <div class="seo-panel-header">
          <div class="seo-panel-header-left">
            <div class="seo-panel-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg></div>
            <div>
              <div class="seo-panel-title">SEO Insights</div>
              <div class="seo-panel-subtitle">Performance overview &amp; comparison</div>
            </div>
          </div>
          <label class="seo-date-picker" for="seoDateRangeInput">
            <span class="seo-cal-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg></span>
            <input type="text" id="seoDateRangeInput" class="date-range-input" readonly />
            <span class="seo-chevron-down"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span>
          </label>
        </div>

        <div class="detail-body" id="seoDetailBody">
          <div id="seoInsightsContent">

            <!-- Overall performance banner -->
            <div class="seo-overall-card">
              <div class="seo-overall-left">
                <div class="seo-overall-badge" id="seoOverallBadge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg></div>
                <div>
                  <div class="seo-overall-label">Overall Performance</div>
                  <div class="seo-overall-status" id="seoOverallStatus">--<span class="seo-overall-status-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg></span></div>
                  <div class="seo-overall-compare" id="seoOverallCompare">Compared to --</div>
                </div>
              </div>
              <div class="seo-overall-stats">
                <div class="seo-overall-stat">
                  <span class="seo-stat-circle is-up"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></svg></span>
                  <div class="seo-stat-body">
                    <span class="seo-stat-count" id="seoImprovedCount">0</span>
                    <div class="seo-stat-name">Improved</div>
                    <div class="seo-stat-sub">vs last month</div>
                  </div>
                </div>
                <div class="seo-overall-stat">
                  <span class="seo-stat-circle is-down"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg></span>
                  <div class="seo-stat-body">
                    <span class="seo-stat-count" id="seoDeclinedCount">0</span>
                    <div class="seo-stat-name">Declined</div>
                    <div class="seo-stat-sub">vs last month</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Metric cards -->
            <div class="seo-metric-grid">
          <div class="seo-metric-card" data-metric="clicks">
            <div class="seo-mc-head">
              <div class="seo-mc-title">
                <span class="seo-mc-icon seo-icon--clicks"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3l14 8-6 1.6L16 20l-3 1.1-2.4-6.9L6 18z"/></svg></span>
                <div>
                  <div class="seo-mc-name">Clicks</div>
                </div>
              </div>
              <div class="seo-mc-status">
                <span id="seoClicksBadge" class="seo-badge">--</span>
                <span id="seoClicksChange" class="seo-mc-pct">--</span>
              </div>
            </div>
            <div id="seoClicks" class="seo-mc-value">--</div>
            <div id="seoClicksDelta" class="seo-mc-delta">--</div>
            <div class="seo-mc-prev">Previous: <span id="seoPrevClicks">--</span></div>
          </div>
          <div class="seo-metric-card" data-metric="impressions">
            <div class="seo-mc-head">
              <div class="seo-mc-title">
                <span class="seo-mc-icon seo-icon--impressions"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></svg></span>
                <div>
                  <div class="seo-mc-name">Impressions</div>
                </div>
              </div>
              <div class="seo-mc-status">
                <span id="seoImpressionsBadge" class="seo-badge">--</span>
                <span id="seoImpressionsChange" class="seo-mc-pct">--</span>
              </div>
            </div>
            <div id="seoImpressions" class="seo-mc-value">--</div>
            <div id="seoImpressionsDelta" class="seo-mc-delta">--</div>
            <div class="seo-mc-prev">Previous: <span id="seoPrevImpressions">--</span></div>
          </div>
          <div class="seo-metric-card" data-metric="ctr">
            <div class="seo-mc-head">
              <div class="seo-mc-title">
                <span class="seo-mc-icon seo-icon--ctr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg></span>
                <div>
                  <div class="seo-mc-name">CTR</div>
                </div>
              </div>
              <div class="seo-mc-status">
                <span id="seoCTRBadge" class="seo-badge">--</span>
                <span id="seoCTRChange" class="seo-mc-pct">--</span>
              </div>
            </div>
            <div id="seoCTR" class="seo-mc-value">--</div>
            <div id="seoCTRDelta" class="seo-mc-delta">--</div>
            <div class="seo-mc-prev">Previous: <span id="seoPrevCTR">--</span></div>
          </div>
          <div class="seo-metric-card" data-metric="position">
            <div class="seo-mc-head">
              <div class="seo-mc-title">
                <span class="seo-mc-icon seo-icon--position"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="11" width="4" height="9" rx="1.2"/><rect x="10" y="5" width="4" height="15" rx="1.2"/><rect x="16" y="14" width="4" height="6" rx="1.2"/></svg></span>
                <div>
                  <div class="seo-mc-name">Average Position</div>
              <div class="seo-mc-sub">(Lower is better)</div>
                </div>
              </div>
              <div class="seo-mc-status">
                <span id="seoPositionBadge" class="seo-badge">--</span>
                <span id="seoPositionChange" class="seo-mc-pct">--</span>
              </div>
            </div>
            <div id="seoPosition" class="seo-mc-value">--</div>
            <div id="seoPositionDelta" class="seo-mc-delta">--</div>
            <div class="seo-mc-prev">Previous: <span id="seoPrevPosition">--</span></div>
          </div>
            </div>

            <!-- Footer note -->
            <div class="seo-footer-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6h.01"/></svg>
              <span>Average Position: Lower is better. Other metrics: Higher is better.</span>
            </div>

          </div>

          <div id="seoNoDataMsg" style="display:none;">
            No matching SEO data found for the given page.
          </div>

        </div>
      </div>
            </div>

              <!-- PERFORMANCE DETAIL -->
              <div id="performanceDetail" class="metric-detail">
                <div class="detail-header">
                  <div class="detail-header-left">
                    <div class="metric-icon-box">
                      <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/performance-metrics.svg" alt="Performance Metrics" />
                    </div>
                    <div>
                      <div class="detail-title">Performance Metrics</div>
                      <div class="detail-subtitle">Core Web Vitals</div>
                    </div>
                  </div>
                  <div class="detail-header-right"></div>
                </div>

                <div class="detail-body">
                  <!-- Loader only for this tab -->
                  <div id="performanceTabLoader" class="loader-container"
                    style="display:none; justify-content:center; align-items:center;flex-direction: column;">
                    <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/GIFImage.gif"
                      alt="Loading spinner" class="custom-loader-image pagespeed-loader" />
                      <div id="status" class="status hidden" role="status" aria-live="polite">
                        <div class="progress">
                          <div id="bar" class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                          </div>
                        </div>
                        <h3 class="status-title" id="statusTitle">Analyzing Accessibility...</h3>
                        <p class="status-msg" id="statusMsg">
                          Please wait while we analyze your site. This process typically takes about a minute.
                        </p>
                      </div>

                      <div id="errorContainer" class="error-container api-error-block hidden">
                        <h3 class="error-title">Something went wrong</h3>
                        <p class="error-msg">We couldn't analyze the site. Please try again.</p>
                        <button id="retryButton" class="retry-btn">Try Again</button>
                      </div>
                  </div>


                  <div id="performanceTabContent">
                    <!-- Performance Score card -->
                    <section class="detail-section--performance">
                      <h3>Performance Score</h3>

                      <div class="performance-score-widget" data-score="65">
                        <div class="gauge-container">
                          <svg class="gauge" viewBox="0 0 150 75" aria-hidden="true">
                            <defs>
                              <!-- Yellow gradient -->
                              <linearGradient id="perfYellowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#FFCE6C" />
                                <stop offset="100%" stop-color="#FCAF17" />
                              </linearGradient>

                              <!-- Violet gradient -->
                              <linearGradient id="perfPurpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#9C5EFA" />
                                <stop offset="100%" stop-color="#512B8B" />
                              </linearGradient>
                            </defs>


                            <path class="gauge-yellow" d="M10,75 A65,65 0 0,1 140,75" stroke="url(#perfYellowGradient)" />
                            <path class="gauge-violet" d="M10,75 A65,65 0 0,1 140,75" stroke="url(#perfPurpleGradient)" />
                            <path class="gauge-inner-dashed" d="M25,75 A50,50 0 0,1 125,75" />
                          </svg>

                          <div class="score-overlay">
                            <div class="score-value">65</div>
                            <img class="score-quality-icon" src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/High-green.svg" alt="High" />
                          </div>
                        </div>
                      </div>

                      <div class="performance-toggle" role="tablist" aria-label="Device">
                        <button id="desktopBtn" class="toggle-btn desktop-toggle-btn active" type="button" role="tab"
                          aria-selected="true">
                          Desktop
                        </button>
                        <button id="mobileBtn" class="toggle-btn mobile-toggle-btn" type="button" role="tab"
                          aria-selected="false">
                          Mobile
                        </button>
                      </div>
                    </section>


                    <section class="detail-section--performance">
                      <h3>What's affecting performance</h3>
                      <div id="desktopMetrics" class="detail-metrics-grid"></div>
                    </section>
                  </div>
                </div>
              </div>

              <!-- ACCESSIBILITY DETAIL -->
              <div id="accessibilityDetail" class="metric-detail">
                <div class="detail-header">
                  <div class="detail-header-left">
                    <div class="metric-icon-box">
                      <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/accessibility-compliance.svg" alt="Accessibility Compliance" />
                    </div>
                    <div>
                      <div class="detail-title">
                        Accessibility Compliance
                      </div>
                      <div class="detail-subtitle">
                        Compliance Metrics
                      </div>
                    </div>
                  </div>
                  <div class="detail-header-right"></div>
                </div>

                <div class="detail-body">

                  <div id="accessibilityTabLoader" class="loader-container"
                    style="display:none; justify-content:center; align-items:center;flex-direction: column;">
                    <img src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/GIFImage.gif"
                      alt="Loading spinner" class="custom-loader-image pagespeed-loader" />
                      <div id="status" class="status hidden" role="status" aria-live="polite">
                        <div class="progress">
                          <div id="bar" class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                          </div>
                        </div>
                        <h3 class="status-title" id="statusTitle">Analyzing Accessibility...</h3>
                        <p class="status-msg" id="statusMsg">
                          Please wait while we analyze your site. This process typically takes about a minute.
                        </p>
                      </div>
                      <div id="errorContainer" class="error-container api-error-block hidden">
                        <h3 class="error-title">Something went wrong</h3>
                        <p class="error-msg">We couldn't analyze the site. Please try again.</p>
                        <button id="retryButton" class="retry-btn">Try Again</button>
                      </div>
                  </div>


                  <div id="accessibilityTabContent">
                    <section class="detail-section--accessibility">
                      <h3>Accessibility Score</h3>

                      <div class="performance-score-widget" data-score="85">
                        <div class="gauge-container">
                          <svg class="gauge" viewBox="0 0 150 75" aria-hidden="true">
                            <defs>
                              <linearGradient id="accYellowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#FFCE6C" />
                                <stop offset="100%" stop-color="#FCAF17" />
                              </linearGradient>
                              <linearGradient id="accPurpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#9C5EFA" />
                                <stop offset="100%" stop-color="#512B8B" />
                              </linearGradient>
                            </defs>

                            <path class="gauge-yellow" d="M10,75 A65,65 0 0,1 140,75" stroke="url(#accYellowGradient)" />
                            <path class="gauge-violet" d="M10,75 A65,65 0 0,1 140,75" stroke="url(#accPurpleGradient)" />
                            <path class="gauge-inner-dashed" d="M25,75 A50,50 0 0,1 125,75" />
                          </svg>

                          <div class="score-overlay">
                            <div class="score-value">85</div>
                            <img class="score-quality-icon" src="/etc.clientlibs/pageInsights/clientlibs/clientlib-insights/resources/images/High-green.svg" alt="High" />
                          </div>
                        </div>
                      </div>

                      <div class="performance-toggle accessibility-toggle" role="tablist" aria-label="Device">
                        <button class="toggle-btn active" type="button" role="tab" aria-selected="true" data-device="desktop">
                          Desktop
                        </button>
                        <button class="toggle-btn" type="button" role="tab" aria-selected="false" data-device="mobile">
                          Mobile
                        </button>
                      </div>
                    </section>
                    <div class="wcag-compliance-metrics">
                      <h3>Compliance Metrics</h3>
                      <div id="trafficMetricsContainer" class="metric-grid"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
}
