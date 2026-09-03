(function (App) {
    const helpers = App.helpers || {};
    const getCurrentPageUrlForApis = helpers.getCurrentPageUrlForApis;

    const SEO_CACHE_TTL_MS = 5 * 60 * 1000;
    const SEO_FETCH_TIMEOUT_MS = 12000;
    const EPS = 1e-9;

    // Metric definitions. higherBetter=false => lower value is an improvement.
    const METRICS = [
        { key: "impressions", type: "integer", higherBetter: true,
          valueId: "seoImpressions", prevId: "seoPrevImpressions", pctId: "seoImpressionsChange",
          badgeId: "seoImpressionsBadge", deltaId: "seoImpressionsDelta",
          dataKeys: ["Impressions", "impressions"] },
        { key: "clicks", type: "integer", higherBetter: true,
          valueId: "seoClicks", prevId: "seoPrevClicks", pctId: "seoClicksChange",
          badgeId: "seoClicksBadge", deltaId: "seoClicksDelta",
          dataKeys: ["Clicks", "clicks"] },
        { key: "ctr", type: "percent", higherBetter: true,
          valueId: "seoCTR", prevId: "seoPrevCTR", pctId: "seoCTRChange",
          badgeId: "seoCTRBadge", deltaId: "seoCTRDelta",
          dataKeys: ["CTR", "ctr"] },
        { key: "position", type: "decimal", higherBetter: false,
          valueId: "seoPosition", prevId: "seoPrevPosition", pctId: "seoPositionChange",
          badgeId: "seoPositionBadge", deltaId: "seoPositionDelta",
          dataKeys: ["Average Position", "Avg Position", "average_position", "position"] }
    ];

    function resolveSeoApiBase() {
        const host = window.location.hostname || "";
        if (host.indexOf("asianpaints.com") !== -1) {
            return window.location.origin + "/apcolourcatalogue/seo_details.json";
        }
        if (host === "localhost" || host === "127.0.0.1") {
            return "http://localhost:4502/apcolourcatalogue/seo_details.json";
        }
        return window.location.origin + "/apcolourcatalogue/seo_details.json";
    }

    function getDefaultDate() {
        return moment().subtract(1, "month");
    }

    function getVersionString(dateMoment) {
        return dateMoment.format("MMMM-YYYY");
    }

    // Full label shown in the header pill and the "Compared to ..." line.
    function getFullMonthLabel(dateMoment) {
        return dateMoment.format("MMMM YYYY");
    }

    // Parse a "MMMM-YYYY" version string back into a moment (start of month).
    function parseVersion(version) {
        const m = moment(version, "MMMM-YYYY", true);
        return m.isValid() ? m.startOf("month") : getDefaultDate();
    }

    function setSeoLoading(isLoading) {
        App.state = App.state || {};
        App.state.seoLoading = isLoading;
        const body = document.getElementById("seoDetailBody");
        if (body) {
            body.classList.toggle("is-loading", isLoading);
        }
    }

    function showNoDataMessage(show) {
        const noData = document.getElementById("seoNoDataMsg");
        if (noData) {
            noData.innerHTML = "<strong>Data Not found.</strong>";
            noData.style.display = show ? "block" : "none";
        }
    }

    // Toggle the whole insights dashboard (everything except the no-data message).
    function setMetricsSectionVisibility(show) {
        const content = document.getElementById("seoInsightsContent");
        if (content) {
            content.style.display = show ? "block" : "none";
        }
    }

    function setMetric(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function setHtml(id, html) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }

    function normalizeNumberLike(value) {
        if (value === null || value === undefined || value === "") return null;
        if (typeof value === "number" && Number.isFinite(value)) return value;
        if (typeof value === "string") {
            const cleaned = value.replace(/,/g, "").replace(/%/g, "").trim();
            const parsed = Number(cleaned);
            return Number.isFinite(parsed) ? parsed : null;
        }
        return null;
    }

    function pickFirst(row, keys) {
        for (let i = 0; i < keys.length; i++) {
            if (row[keys[i]] !== undefined && row[keys[i]] !== null && row[keys[i]] !== "") {
                return row[keys[i]];
            }
        }
        return null;
    }

    // Fixed decimals but with trailing zeros trimmed: 6.20 -> "6.2", 6.27 -> "6.27".
    function trimNum(n, maxDec) {
        let s = Number(n).toFixed(maxDec);
        if (s.indexOf(".") !== -1) {
            s = s.replace(/0+$/, "").replace(/\.$/, "");
        }
        return s;
    }

    function formatInteger(value) {
        const n = normalizeNumberLike(value);
        return n === null ? "--" : Math.round(n).toLocaleString("en-IN");
    }

    function formatPercent(value) {
        const n = normalizeNumberLike(value);
        return n === null ? "--" : trimNum(n, 2) + "%";
    }

    function formatDecimal(value) {
        const n = normalizeNumberLike(value);
        return n === null ? "--" : trimNum(n, 2);
    }

    function formatValue(type, n) {
        if (n === null) return "--";
        if (type === "integer") return formatInteger(n);
        if (type === "percent") return formatPercent(n);
        return formatDecimal(n);
    }

    // Parse pipe-separated metric value: "current|previous|difference"
    // Examples:
    //   "1,740,018|NA|NEW" => {current: 1740018, previous: null, difference: null, isNew: true}
    //   "1,742,070|1,740,018|+0.1%" => {current: 1742070, previous: 1740018, difference: "+0.1%", isNew: false}
    function parseMetricValue(valueString) {
        if (typeof valueString !== "string") return { current: null, previous: null, difference: null, isNew: false };
        
        const parts = valueString.split("|");
        if (parts.length < 1) return { current: null, previous: null, difference: null, isNew: false };
        
        const current = normalizeNumberLike(parts[0]);
        let previous = null;
        let difference = null;
        let isNew = false;
        
        if (parts.length >= 2) {
            const prevPart = parts[1].toUpperCase().trim();
            if (prevPart === "NA") {
                previous = null;
            } else {
                previous = normalizeNumberLike(parts[1]);
            }
        }
        
        if (parts.length >= 3) {
            const diffPart = parts[2].trim().toUpperCase();
            if (diffPart === "NEW") {
                isNew = true;
                difference = null;
            } else {
                difference = parts[2].trim(); // Keep original formatted string: "+0.1%", "-8.4%", "+0.1", "-0.2"
            }
        }
        
        return { current, previous, difference, isNew };
    }

    function extractValue(row, dataKeys) {
        const rawValue = pickFirst(row || {}, dataKeys);
        if (!rawValue) return { current: null, previous: null, difference: null, isNew: false };
        
        // Check if this is the new pipe-separated format
        if (typeof rawValue === "string" && rawValue.indexOf("|") !== -1) {
            return parseMetricValue(rawValue);
        }
        
        // Legacy format: just a raw value
        return { current: normalizeNumberLike(rawValue), previous: null, difference: null, isNew: false };
    }

    function chevronSvg(up) {
        const d = up ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6";
        return '<svg class="seo-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="' + d + '"/></svg>';
    }

    // Signed improvement %: positive means the metric got better.
    // If differenceStr is provided from API, parse it; otherwise calculate.
    function improvementPercent(spec, cur, prev, differenceStr) {
        // If API provided the difference, parse and use it
        if (differenceStr && typeof differenceStr === "string") {
            const cleaned = differenceStr.replace(/,/g, "").replace(/[%]/g, "").trim();
            const parsed = Number(cleaned);
            if (Number.isFinite(parsed)) return parsed; // Already in percentage form
        }
        
        // Fallback: calculate from current and previous
        if (cur === null || prev === null || prev === 0) return null;
        const raw = spec.higherBetter
            ? (cur - prev) / Math.abs(prev)
            : (prev - cur) / Math.abs(prev);
        return raw * 100;
    }

    function statusOf(pct) {
        if (pct === null) return "none";
        if (pct > EPS) return "improved";
        if (pct < -EPS) return "declined";
        return "flat";
    }

    // Human text for the "vs last month" delta line.
    function deltaText(spec, cur, prev) {
        const d = cur - prev; // raw change in the metric value
        if (spec.type === "integer") {
            if (Math.abs(d) < EPS) return "No change vs last month";
            const sign = d > 0 ? "+" : "-";
            return sign + Math.abs(Math.round(d)).toLocaleString("en-IN") + " vs last month";
        }
        if (spec.type === "percent") {
            if (Math.abs(d) < 0.005) return "No change vs last month";
            const sign = d > 0 ? "+" : "-";
            return sign + trimNum(Math.abs(d), 2) + "% vs last month";
        }
        // position: lower is better -> report improvement magnitude
        const improvement = prev - cur;
        if (Math.abs(improvement) < 0.005) return "No change vs last month";
        const mag = trimNum(Math.abs(improvement), 2);
        const unit = Math.abs(improvement) === 1 ? "position" : "positions";
        return (improvement > 0 ? "Improved by " : "Declined by ") + mag + " " + unit;
    }

    function renderCard(spec, metricData, prev) {
        // metricData can be either a number (legacy) or {current, previous, difference, isNew}
        let cur, difference, isNew;
        if (metricData && typeof metricData === "object" && "current" in metricData) {
            cur = metricData.current;
            difference = metricData.difference;
            isNew = metricData.isNew;
            // If new parsed data has previous value, use it; otherwise use prev parameter
            if (metricData.previous !== null && metricData.previous !== undefined) {
                prev = metricData.previous;
            }
        } else {
            cur = metricData; // Legacy format
            difference = null;
            isNew = false;
        }

        setMetric(spec.valueId, formatValue(spec.type, cur));
        setMetric(spec.prevId, prev === null ? "--" : formatValue(spec.type, prev));

        const badge = document.getElementById(spec.badgeId);
        const pctEl = document.getElementById(spec.pctId);
        const deltaEl = document.getElementById(spec.deltaId);

        const pct = improvementPercent(spec, cur, prev, difference);
        const status = isNew ? "new" : statusOf(pct);

        // No comparison available (missing previous month, zero baseline, or new data).
        if (status === "none" || status === "new") {
            const badgeText = isNew ? "New Data" : "No data";
            const deltaText = isNew ? "First month of data" : "No previous data";
            if (badge) { badge.className = "seo-badge"; badge.textContent = badgeText; }
            if (pctEl) { pctEl.className = "seo-mc-pct"; pctEl.textContent = "--"; }
            if (deltaEl) { deltaEl.className = "seo-mc-delta"; deltaEl.textContent = deltaText; }
            return { status: isNew ? "none" : "none" }; // Don't count as improved/declined
        }

        const good = status === "improved";
        const bad = status === "declined";
        const toneClass = good ? " is-good" : (bad ? " is-bad" : "");

        // Badge
        if (badge) {
            badge.className = "seo-badge" + toneClass;
            badge.textContent = good ? "Improved" : (bad ? "Declined" : "No change");
        }

        // Percentage change (top-right)
        if (pctEl) {
            pctEl.className = "seo-mc-pct" + toneClass;
            if (status === "flat") {
                pctEl.textContent = "0%";
            } else {
                pctEl.innerHTML = chevronSvg(good) +
                    '<span>' + pct.toFixed(1) + '%</span>';
            }
        }

        // Delta line ("vs last month")
        if (deltaEl) {
            deltaEl.className = "seo-mc-delta" + toneClass;
            const text = deltaText(spec, cur, prev);
            if (status === "flat") {
                deltaEl.textContent = text;
            } else {
                deltaEl.innerHTML = chevronSvg(good) + '<span>' + text + '</span>';
            }
        }

        return { status: status };
    }

    function renderOverall(improved, declined, previousDate) {
        setMetric("seoImprovedCount", String(improved));
        setMetric("seoDeclinedCount", String(declined));
        setMetric("seoOverallCompare", "Compared to " + getFullMonthLabel(previousDate));

        const statusEl = document.getElementById("seoOverallStatus");
        const badgeEl = document.getElementById("seoOverallBadge");

        let label, tone;
        if (improved === 0 && declined === 0) {
            label = "No change"; tone = "neutral";
        } else if (improved > declined) {
            label = "Improved"; tone = "good";
        } else if (declined > improved) {
            label = "Declined"; tone = "bad";
        } else {
            label = "Mixed"; tone = "neutral";
        }

        const arrow = '<span class="seo-overall-status-arrow">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
            'stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg></span>';

        if (statusEl) {
            statusEl.className = "seo-overall-status" +
                (tone === "bad" ? " is-bad" : (tone === "neutral" ? " is-neutral" : ""));
            statusEl.innerHTML = label + arrow;
        }
        if (badgeEl) {
            badgeEl.className = "seo-overall-badge" +
                (tone === "bad" ? " is-bad" : (tone === "neutral" ? " is-neutral" : ""));
        }
    }

    function renderInsights(currentRows, prevRows, currentDate, previousDate) {
        const hasCurrent = currentRows && currentRows.length;

        if (!hasCurrent) {
            setMetricsSectionVisibility(false);
            showNoDataMessage(true);
            return;
        }

        setMetricsSectionVisibility(true);
        showNoDataMessage(false);

        // Keep the header pill in sync with the month being shown.
        const input = document.getElementById("seoDateRangeInput");
        if (input) input.value = getFullMonthLabel(currentDate);

        const curRow = currentRows[0] || {};
        const prevRow = (prevRows && prevRows.length) ? prevRows[0] : null;

        let improved = 0;
        let declined = 0;

        METRICS.forEach(function (spec) {
            // With new API format, extractValue returns {current, previous, difference, isNew}
            const metricData = extractValue(curRow, spec.dataKeys);
            // For backward compatibility, handle legacy format
            const prevMetricData = prevRow ? extractValue(prevRow, spec.dataKeys) : null;
            const prevValue = prevMetricData && typeof prevMetricData === "object" ? prevMetricData.current : prevMetricData;
            
            const res = renderCard(spec, metricData, prevValue);
            if (res.status === "improved") improved++;
            else if (res.status === "declined") declined++;
        });

        renderOverall(improved, declined, previousDate);
    }

    function resetMetrics() {
        METRICS.forEach(function (spec) {
            setMetric(spec.valueId, "--");
            setMetric(spec.prevId, "--");
            const badge = document.getElementById(spec.badgeId);
            if (badge) { badge.className = "seo-badge"; badge.textContent = "--"; }
            const pctEl = document.getElementById(spec.pctId);
            if (pctEl) { pctEl.className = "seo-mc-pct"; pctEl.textContent = "--"; }
            const deltaEl = document.getElementById(spec.deltaId);
            if (deltaEl) { deltaEl.className = "seo-mc-delta"; deltaEl.textContent = "--"; }
        });
        setMetric("seoImprovedCount", "0");
        setMetric("seoDeclinedCount", "0");
        const statusEl = document.getElementById("seoOverallStatus");
        if (statusEl) { statusEl.className = "seo-overall-status"; statusEl.innerHTML = ""; }
    }

    function getPageUrlForSeo(inputUrl) {
        let pageUrl = inputUrl;
        if (typeof pageUrl !== "string" || !pageUrl.trim()) {
            pageUrl = window.location.href;
        }
        try {
            const parsed = new URL(pageUrl, window.location.origin);
            let path = parsed.pathname || "/";
            path = path.replace(/\.html$/, "");
            if (path === "/content/ap/en/home" || path === "/content/ap/en/home/") {
                path = "/";
            } else if (path.indexOf("/content/ap/en/home/") === 0) {
                path = "/" + path.slice("/content/ap/en/home/".length);
            }
            path = path.replace(/\/+/g, "/");
            if (path !== "/" && path.endsWith("/")) {
                path = path.slice(0, -1);
            }
            path = "https://www.asianpaints.com" + path;
            if (path !== "https://www.asianpaints.com/") {
                return path + ".html";
            } else {
                return "" + path;
            }
        } catch (e) {
            return "https://www.asianpaints.com/";
        }
    }

    function getCacheEntry(cacheKey) {
        App.state = App.state || {};
        App.state.seoCache = App.state.seoCache || Object.create(null);
        const entry = App.state.seoCache[cacheKey];
        if (!entry) return null;
        if ((Date.now() - entry.ts) > SEO_CACHE_TTL_MS) {
            delete App.state.seoCache[cacheKey];
            return null;
        }
        return entry.data;
    }

    function setCacheEntry(cacheKey, data) {
        App.state = App.state || {};
        App.state.seoCache = App.state.seoCache || Object.create(null);
        App.state.seoCache[cacheKey] = { ts: Date.now(), data: data };
    }

    // Fetch a single month (cache-aware). Resolves to an array of rows,
    // empty on error / no data. Re-throws only AbortError.
    function fetchSeoMonth(currentPageUrl, version, signal) {
        const cacheKey = currentPageUrl + "|" + version;
        const cached = getCacheEntry(cacheKey);
        if (cached) return Promise.resolve(cached);

        const url = resolveSeoApiBase() +
            "?pagePath=" + encodeURIComponent(currentPageUrl) +
            "&version=" + encodeURIComponent(version);

        return fetch(url, { method: "GET", headers: { Accept: "application/json" }, signal: signal })
            .then(function (res) {
                if (!res.ok) throw new Error("SEO API request failed: " + res.status);
                return res.json();
            })
            .then(function (json) {
                const data = (json && Array.isArray(json.data)) ? json.data : [];
                setCacheEntry(cacheKey, data);
                return data;
            })
            .catch(function (err) {
                if (err && err.name === "AbortError") throw err;
                return [];
            });
    }

    // Fetches the selected month data and renders the dashboard.
    // With new API format, currentRows already contains current and previous data,
    // so prevRows is not needed.
    function fetchSeoMetrics(version, pageUrl = window.location.href) {
        App.state = App.state || {};

        const currentPageUrl = getPageUrlForSeo(pageUrl);
        const currentVersion = version || getVersionString(getDefaultDate());
        const currentDate = parseVersion(currentVersion);
        const previousDate = currentDate.clone().subtract(1, "month");
        const previousVersion = getVersionString(previousDate);

        const currentCached = getCacheEntry(currentPageUrl + "|" + currentVersion);
        const previousCached = getCacheEntry(currentPageUrl + "|" + previousVersion);
        const needsFetch = !currentCached || !previousCached;

        if (App.state.seoRequestController) {
            App.state.seoRequestController.abort();
        }
        const controller = new AbortController();
        App.state.seoRequestController = controller;

        if (needsFetch) setSeoLoading(true);

        const timeoutId = setTimeout(function () { controller.abort(); }, SEO_FETCH_TIMEOUT_MS);

        return Promise.all([
            fetchSeoMonth(currentPageUrl, currentVersion, controller.signal),
            fetchSeoMonth(currentPageUrl, previousVersion, controller.signal)
        ])
            .then(function (results) {
                const currentRows = results[0] || [];
                const prevRows = results[1] || [];
                App.state.lastSeoVersion = currentVersion;
                renderInsights(currentRows, prevRows, currentDate, previousDate);
                return currentRows;
            })
            .catch(function (err) {
                if (err && err.name === "AbortError") return [];
                resetMetrics();
                setMetricsSectionVisibility(false);
                showNoDataMessage(true);
                return [];
            })
            .finally(function () {
                clearTimeout(timeoutId);
                if (App.state.seoRequestController === controller) {
                    App.state.seoRequestController = null;
                }
                setSeoLoading(false);
            });
    }

    function showMonthPicker(input, currentDate, onApply) {
        const old = document.getElementById("seo-month-picker");
        if (old) old.remove();

        const sidebar = document.getElementById("metricsSidebar");
        if (!sidebar) return;

        const picker = document.createElement("div");
        picker.id = "seo-month-picker";
        picker.setAttribute("role", "dialog");

        picker.style.position = "absolute";
        picker.style.background = "#fff";
        picker.style.padding = "12px";
        picker.style.border = "1px solid #ddd";
        picker.style.borderRadius = "10px";
        picker.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        picker.style.zIndex = "999999";

        sidebar.appendChild(picker);

        const rect = input.getBoundingClientRect();
        const sidebarRect = sidebar.getBoundingClientRect();
        picker.style.top = (rect.bottom - sidebarRect.top + 8) + "px";
        picker.style.left = (rect.left - sidebarRect.left) + "px";

        const today = moment();
        const currentYear = today.year();
        const currentMonth = today.month();

        const yearSelect = document.createElement("select");
        const monthSelect = document.createElement("select");

        for (let y = currentYear; y >= currentYear - 5; y--) {
            const opt = document.createElement("option");
            opt.value = String(y);
            opt.text = String(y);
            if (y === currentDate.year()) opt.selected = true;
            yearSelect.appendChild(opt);
        }

        function populateMonths(selectedYear) {
            monthSelect.innerHTML = "";
            moment.monthsShort().forEach(function (m, i) {
                let allow = false;
                if (selectedYear < currentYear) {
                    allow = true;
                } else if (selectedYear === currentYear && i < currentMonth) {
                    allow = true;
                }
                if (!allow) return;

                const opt = document.createElement("option");
                opt.value = String(i);
                opt.text = m;
                if (selectedYear === currentDate.year() && i === currentDate.month()) {
                    opt.selected = true;
                }
                monthSelect.appendChild(opt);
            });

            if (!monthSelect.value && monthSelect.options.length > 0) {
                monthSelect.selectedIndex = monthSelect.options.length - 1;
            }
            applyBtn.disabled = monthSelect.options.length === 0;
        }

        yearSelect.onchange = function () {
            populateMonths(Number(yearSelect.value));
        };

        const applyBtn = document.createElement("button");
        applyBtn.innerText = "Apply";
        applyBtn.style.marginTop = "10px";
        applyBtn.style.padding = "6px 14px";
        applyBtn.style.background = "#5b2d91";
        applyBtn.style.color = "#fff";
        applyBtn.style.border = "none";
        applyBtn.style.borderRadius = "6px";
        applyBtn.style.cursor = "pointer";

        applyBtn.onclick = function () {
            const monthValue = Number(monthSelect.value);
            const yearValue = Number(yearSelect.value);
            if (!Number.isFinite(monthValue) || !Number.isFinite(yearValue)) return;
            const newDate = moment({ year: yearValue, month: monthValue });
            onApply(newDate);
            closePicker();
        };

        picker.appendChild(yearSelect);
        picker.appendChild(monthSelect);
        picker.appendChild(document.createElement("br"));
        picker.appendChild(applyBtn);

        populateMonths(currentDate.year());

        function cleanup() {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("click", onOutsideClick);
        }
        function closePicker() {
            cleanup();
            picker.remove();
        }
        function onOutsideClick(e) {
            if (!picker.contains(e.target) && e.target !== input) {
                closePicker();
            }
        }
        function onKeyDown(e) {
            if (e.key === "Escape") closePicker();
        }

        setTimeout(function () {
            document.addEventListener("click", onOutsideClick);
            document.addEventListener("keydown", onKeyDown);
        }, 0);
    }

    function init() {
        const input = document.getElementById("seoDateRangeInput");
        if (!input || !window.moment) return;

        App.state = App.state || {};
        App.state.seoCache = App.state.seoCache || Object.create(null);

        let selectedDate = getDefaultDate();

        if (input.dataset.seoBound === "true") {
            if (App.state.lastSeoVersion) {
                fetchSeoMetrics(App.state.lastSeoVersion);
            }
            return;
        }

        input.dataset.seoBound = "true";
        input.value = getFullMonthLabel(selectedDate);

        input.onclick = function (e) {
            e.stopPropagation();
            showMonthPicker(input, selectedDate, function (newDate) {
                selectedDate = newDate;
                input.value = getFullMonthLabel(selectedDate);
                fetchSeoMetrics(getVersionString(selectedDate));
            });
        };

        fetchSeoMetrics(getVersionString(selectedDate));
    }

    App.seo = {
        init: init,
        fetchSeoMetrics: fetchSeoMetrics,
        getDefaultVersion: function () {
            return getVersionString(getDefaultDate());
        }
    };

})(window.App = window.App || {});
