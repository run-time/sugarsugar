// a specialized trend indicator for glucose data
// This component displays a circular trend indicator with a mini graph below it
import './glucose-mini-graph.js';

// --- Display window state ---
// Store the full 6-hour data set and current display window globally
window._glucoseFullData = null; // full 6-hour data
window._glucoseDisplayWindow = 2; // default hours to show
window._glucoseDisplayWindowOptions = [2, 4, 6, 8]; // allowed window sizes

// Helper to update all mini-graphs with the current window
function updateMiniGraphsDisplayWindow() {
  const allGraphs = document.querySelectorAll('glucose-mini-graph');
  allGraphs.forEach((graph) => {
    if (window._glucoseFullData && Array.isArray(window._glucoseFullData)) {
      // Slice the data for the current window
      const hours = window._glucoseDisplayWindow;
      const now = Date.now();
      const msWindow = hours * 60 * 60 * 1000;
      const filtered = window._glucoseFullData.filter((r) => {
        const t = new Date(r.time).getTime();
        return now - t <= msWindow;
      });
      // Always update data and force render, even if hidden
      if (typeof graph.updateData === 'function') {
        graph.updateData(filtered);
      } else {
        graph.data = filtered;
      }
      // If the graph is hidden, force a render so it will be correct when shown
      if (graph.style && graph.style.display === 'none') {
        graph.render && graph.render();
      }
    }
  });
}
export function getCGMTrendicator(data) {
  let retElement = '';
  const BENCHMARKS = window.BENCHMARKS || { HIGH: 240, LOW: 60 };
  const benchAttrs = `benchmark-high="${BENCHMARKS.HIGH}" benchmark-low="${BENCHMARKS.LOW}" hoursOfHistory="3"`;

  if (!data || !data.value) {
    retElement = `<circle-trendicator value="??" trend="?" rotation="off" theme="default" ${benchAttrs}></circle-trendicator>`;
  } else if (data.minutes_ago > 20) {
    retElement = `<circle-trendicator value="${data.value}" trend="${data.minutes_ago}m ago" rotation="off" theme="error" ${benchAttrs}></circle-trendicator>`;
  } else if (parseInt(data.value, 0) < 40) {
    retElement = `<circle-trendicator value="LOW" trend="below 40" rotation="off" theme="low" ${benchAttrs}></circle-trendicator>`;
  } else if (parseInt(data.value, 0) > 400) {
    retElement = `<circle-trendicator value="HIGH" trend="above 400" rotation="off" theme="high" ${benchAttrs}></circle-trendicator>`;
  } else {
    const trendMap = {
      '—': 'off',
      '⇈': '0',
      '↑': '0',
      '↗': '45',
      '→': '90',
      '↘': '135',
      '↓': '180',
      '⇊': '180',
      '?': 'off',
      '!': 'off',
    };

    const trendSymbol = data.trend.symbol || '—';

    const glucoseValue = data.value;

    let glucoseTrend = '';
    if (data.value_difference) {
      if (data.value_difference > 0) {
        glucoseTrend = `+${data.value_difference}`;
      } else {
        glucoseTrend = `${data.value_difference}`;
      }
    }

    const glucoseTheme =
      parseInt(data.value) === 39
        ? 'maxlow'
        : parseInt(data.value) === 401
          ? 'maxhigh'
          : data.status === 'LOW'
            ? 'low'
            : data.status === 'HIGH'
              ? 'high'
              : 'default';

    const glucoseRotation = trendMap[trendSymbol] || 'off';

    const calcAlert =
      data.trend.symbol === '⇈' || data.trend.symbol === '⇊'
        ? 'alert="true"'
        : '';

    retElement = `<circle-trendicator value="${glucoseValue}" trend="${glucoseTrend}" rotation="${glucoseRotation}" theme="${glucoseTheme}" ${calcAlert} ${benchAttrs}></circle-trendicator>`;
  }

  return retElement;
}

class CircleTrendicator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._graphVisible = false;
    this._graphElem = null;
  }

  static get observedAttributes() {
    return [
      'alert',
      'value',
      'trend',
      'theme',
      'fgColor',
      'bgColor',
      'size',
      'rotation',
      'hoursOfHistory',
    ];
  }

  get hoursOfHistory() {
    const attr = this.getAttribute('hoursOfHistory');
    const val = parseFloat(attr);
    // Default to 0 if not set or invalid
    return !isNaN(val) && val > 0 ? val : 0;
  }

  connectedCallback() {
    this.render();
    if (this.hoursOfHistory !== 0) {
      this._preloadGraphData();
      this.addEventListener('click', this._onClick.bind(this));
    }
  }

  async _preloadGraphData() {
    if (!this._graphElem) {
      this._graphElem = document.createElement('glucose-mini-graph');
      this._graphElem.style.marginTop = '8px';
      this._graphElem.style.display = 'block';
      this._graphElem.style.boxShadow = '0 2px 8px #0002';
      this._graphElem.style.borderRadius = '12px';
      // Pass benchmark and rotation attributes if present
      if (this.hasAttribute('benchmark-high')) {
        this._graphElem.setAttribute(
          'benchmark-high',
          this.getAttribute('benchmark-high'),
        );
      }
      if (this.hasAttribute('benchmark-low')) {
        this._graphElem.setAttribute(
          'benchmark-low',
          this.getAttribute('benchmark-low'),
        );
      }
      if (this.hasAttribute('rotation')) {
        this._graphElem.setAttribute('rotation', this.getAttribute('rotation'));
      }
    } else {
      // Update attributes if they change after creation
      if (this.hasAttribute('benchmark-high')) {
        this._graphElem.setAttribute(
          'benchmark-high',
          this.getAttribute('benchmark-high'),
        );
      } else {
        this._graphElem.removeAttribute('benchmark-high');
      }
      if (this.hasAttribute('benchmark-low')) {
        this._graphElem.setAttribute(
          'benchmark-low',
          this.getAttribute('benchmark-low'),
        );
      } else {
        this._graphElem.removeAttribute('benchmark-low');
      }
      if (this.hasAttribute('rotation')) {
        this._graphElem.setAttribute('rotation', this.getAttribute('rotation'));
      } else {
        this._graphElem.removeAttribute('rotation');
      }
    }
    this._graphElem.innerHTML = '<div style="padding:8px;">Loading…</div>';
    let data = null;
    let error = null;
    let lastUrl = null;
    // Always fetch 8 hours for full data set (to support all window options)
    const hours = 8;
    for (const url of [
      `/graph?hours=${hours}`,
      `https://sugarsugar.vercel.app/graph?hours=${hours}`,
    ]) {
      try {
        lastUrl = url;
        console.log('[CircleTrendicator] Fetching graph data from', url);
        const resp = await fetch(url);
        if (!resp.ok) {
          console.warn(
            '[CircleTrendicator] Response not ok for',
            url,
            resp.status,
          );
          continue;
        }
        data = await resp.json();
        console.log('[CircleTrendicator] Data received:', data);
        break;
      } catch (err) {
        error = err;
        console.error('[CircleTrendicator] Error fetching', lastUrl, err);
      }
    }
    // Ensure the custom element is upgraded before setting data
    if (window.customElements && window.customElements.upgrade) {
      window.customElements.upgrade(this._graphElem);
    }
    if (data && data.readings && Array.isArray(data.readings)) {
      // Store full data globally
      window._glucoseFullData = data.readings;
      // Set initial display window if not set
      if (!window._glucoseDisplayWindow) window._glucoseDisplayWindow = 2;
      // Slice for current window
      const hours = window._glucoseDisplayWindow;
      const now = Date.now();
      const msWindow = hours * 60 * 60 * 1000;
      const filtered = data.readings.filter((r) => {
        const t = new Date(r.time).getTime();
        return now - t <= msWindow;
      });
      this._graphElem.data = filtered;
      this._graphElem._preloadError = null;
      // Do not add a click handler here; glucose-mini-graph.js handles cycling
      // Also allow clicking the circle trendicator to cycle window
      this.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const opts = window._glucoseDisplayWindowOptions;
        let idx = opts.indexOf(window._glucoseDisplayWindow);
        idx = (idx + 1) % opts.length;
        window._glucoseDisplayWindow = opts[idx];
        updateMiniGraphsDisplayWindow();
      });
    } else if (error) {
      this._graphElem._preloadError = 'Error loading graph';
      this._graphElem.innerHTML =
        '<div style="padding:8px;color:#c00;">Error loading graph</div>';
      console.error('[CircleTrendicator] Error loading graph:', error);
    } else {
      this._graphElem._preloadError = 'No data';
      this._graphElem.innerHTML =
        '<div style="padding:8px;color:#c00;">No data</div>';
      console.warn('[CircleTrendicator] No data found for graph.');
    }
  }
  render() {
    const size = this.size;
    const borderWidth = Math.round(size * 0.068);
    const borderRadius = Math.round(size * 0.14);
    const innerBorderWidth = Math.round(size * 0.02);
    const fontSize =
      this.value === 'LOW' || this.value === 'HIGH'
        ? Math.round(size * 0.3)
        : Math.round(size * 0.36);
    const trendFontSize = Math.round(size * 0.14);
    const indicatorArrowElement =
      this.rotation === 'off' ? '' : '<div class="arrow-indicator"></div>';
    const alertSignal = this.alert
      ? `
      .arrow-indicator::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: ${size}px;
        height: ${size}px;
        background-color: #fff;
        border: 0px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(360deg);
        z-index: 4;
        display: block;
        pointer-events: none;
      }
    `
      : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
          cursor: ${this.hoursOfHistory !== 0 ? 'pointer' : 'default'};
        }

        .container {
          position: relative;
          display: inline-block;
        }

        .main-circle {
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${borderWidth}px ${this.theme === 'error' ? 'dashed' : 'solid'} ${this.indColor};
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          background-color: ${this.bgColor};
          flex-direction: column;
        }

        #mini-graph-slot {
          position: relative;
          width: 100%;
          background: ${this.indColor};
          border-radius: ${borderRadius * 0.4}px;
          box-shadow: 0 2px 8px #0002;
          pointer-events: auto;
          margin-top: ${Math.round(size * 0.12) + (this.rotation !== 0 && this.rotation !== 180 && this.rotation !== 'off' ? -10 : 0)}px;
          z-index: 100;
        }
        
        #mini-graph-slot > * {
          pointer-events: auto;
        }

        .inner-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          border-radius: 50%;
          border: ${innerBorderWidth}px solid white;
        }

        .value-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: ${fontSize}px;
          font-weight: bold;
          color: ${this.fgColor};
          z-index: 20;
          position: relative;
          line-height: 1;
          margin: 0;
        }

        .trend-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: ${trendFontSize}px;
          color: ${this.theme === 'error' ? this.bgColor : this.fgColor};
          background-color: ${this.theme === 'error' ? this.fgColor : 'transparent'};
          border-radius: ${this.theme === 'error' ? `${borderRadius}px` : 'unset'};
          padding: ${this.theme === 'error' ? `0px ${(0.5 * borderRadius).toString()}px` : '0'};
          z-index: 20;
          position: relative;
          margin: 0;
          margin-top: ${this.theme === 'error' ? '2px' : '-2px'};
          opacity: ${this.theme === 'error' ? 1 : 0.6};
        }

        .arrow-indicator {
          position: absolute;
          top: 0;
          left: 0;
          width: ${size}px;
          height: ${size}px;
          background-color: ${this.indColor};
          border: ${borderWidth}px solid ${this.indColor};
          border-radius: 50% 50% 50% 0;
          transform: rotate(${this.rotation + 135}deg);
          z-index: 1;
        }
        
        ${alertSignal}
        
      </style>
      
      <div class="trendicator-wrapper">
        <div class="container">
          <div class="main-circle">
            <div class="inner-border"></div>
            <div class="value-text ${this.theme}">${this.value}</div>
            <div class="trend-text ${this.theme}">${this.trend}</div>
          </div>
          ${indicatorArrowElement}
        </div>
        <div id="mini-graph-slot"></div>
      </div>
    `;
    // Attach the mini graph if visible
    const slot = this.shadowRoot.getElementById('mini-graph-slot');
    // Always update benchmark attributes before attaching
    if (this._graphElem) {
      const high = this.getAttribute('benchmark-high');
      const low = this.getAttribute('benchmark-low');
      console.log(
        '[CircleTrendicator] Passing benchmark-high:',
        high,
        'benchmark-low:',
        low,
      );
      if (this.hasAttribute('benchmark-high')) {
        this._graphElem.setAttribute('benchmark-high', high);
      } else {
        this._graphElem.removeAttribute('benchmark-high');
      }
      if (this.hasAttribute('benchmark-low')) {
        this._graphElem.setAttribute('benchmark-low', low);
      } else {
        this._graphElem.removeAttribute('benchmark-low');
      }
    }
    if (this._graphVisible && this._graphElem) {
      if (!slot.contains(this._graphElem)) {
        slot.appendChild(this._graphElem);
        // Always reset cycling state after attaching
        if (typeof this._graphElem.resetDisplayWindow === 'function') {
          this._graphElem.resetDisplayWindow();
        }
        // Set data again after attaching to DOM to ensure rendering
        if (this._graphElem._preloadError == null && this._graphElem._data) {
          this._graphElem.data = this._graphElem._data;
        }
      }
    } else if (this._graphElem && slot.contains(this._graphElem)) {
      slot.removeChild(this._graphElem);
    }
  }

  _onClick(e) {
    e.stopPropagation();
    // If opening the mini graph, reset the mini-graph's local cycling state only
    if (!this._graphVisible) {
      if (
        this._graphElem &&
        typeof this._graphElem.resetDisplayWindow === 'function'
      ) {
        this._graphElem.resetDisplayWindow();
      }
    }
    this._graphVisible = !this._graphVisible;
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get themes() {
    return {
      default: {
        fg: '#000000',
        bg: '#dadada',
        ind: '#909090',
        alert: '#222222',
      },
      high: {
        fg: '#000000',
        bg: '#ffcc3c',
        ind: '#909090',
        alert: '#ccaa60',
      },
      maxhigh: {
        fg: '#000000',
        bg: '#ffcc3c',
        ind: '#ffcc3c',
        alert: '#ffcc3c',
      },
      low: {
        fg: '#ffffff',
        bg: '#f43c44',
        ind: '#909090',
        alert: '#cc6060',
      },
      maxlow: {
        fg: '#ffffff',
        bg: '#f43c44',
        ind: '#f43c44',
        alert: '#f43c44',
      },
      error: {
        fg: '#cc6060',
        bg: '#ffffff',
        ind: '#cc6060',
        alert: '#cc6060',
      },
    };
  }

  get value() {
    return this.getAttribute('value') || '';
  }

  get trend() {
    return this.getAttribute('trend') || '';
  }

  get alert() {
    return !!this.getAttribute('alert') || false;
  }

  get bgColor() {
    return this.getAttribute('bgColor') || this.themes[this.theme].bg;
  }

  get fgColor() {
    return this.getAttribute('fgColor') || this.themes[this.theme].fg;
  }

  get indColor() {
    return this.getAttribute('indColor') || this.themes[this.theme].ind;
  }

  get theme() {
    return this.getAttribute('theme') || 'default';
  }

  get size() {
    return Number.parseInt(this.getAttribute('size')) || 140;
  }

  get rotation() {
    const r = this.getAttribute('rotation');

    if (r === 'off') {
      return 'off';
    } else {
      const parsed = Number.parseInt(r);
      return Number.isNaN(parsed) ? 90 : parsed;
    }
  }
}

customElements.define('circle-trendicator', CircleTrendicator);
