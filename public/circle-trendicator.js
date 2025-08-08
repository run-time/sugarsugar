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
      // Pass benchmark attributes if present
      if (this.hasAttribute('benchmark-high')) {
        this._graphElem.setAttribute('benchmark-high', this.getAttribute('benchmark-high'));
      }
      if (this.hasAttribute('benchmark-low')) {
        this._graphElem.setAttribute('benchmark-low', this.getAttribute('benchmark-low'));
      }
    } else {
      // Update attributes if they change after creation
      if (this.hasAttribute('benchmark-high')) {
        this._graphElem.setAttribute('benchmark-high', this.getAttribute('benchmark-high'));
      } else {
        this._graphElem.removeAttribute('benchmark-high');
      }
      if (this.hasAttribute('benchmark-low')) {
        this._graphElem.setAttribute('benchmark-low', this.getAttribute('benchmark-low'));
      } else {
        this._graphElem.removeAttribute('benchmark-low');
      }
    }
    this._graphElem.innerHTML = '<div style="padding:8px;">Loading…</div>';
    let data = null;
    let error = null;
    let lastUrl = null;
    const hours = this.hoursOfHistory;
    for (const url of [`/graph?hours=${hours}`, `/api/graph?hours=${hours}`]) {
      try {
        lastUrl = url;
        console.log('[CircleTrendicator] Fetching graph data from', url);
        const resp = await fetch(url);
        if (!resp.ok) {
          console.warn('[CircleTrendicator] Response not ok for', url, resp.status);
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
      console.log('[CircleTrendicator] Setting data on glucose-mini-graph:', data.readings);
      this._graphElem.data = data.readings;
      this._graphElem._preloadError = null;
    } else if (error) {
      this._graphElem._preloadError = 'Error loading graph';
      this._graphElem.innerHTML = '<div style="padding:8px;color:#c00;">Error loading graph</div>';
      console.error('[CircleTrendicator] Error loading graph:', error);
    } else {
      this._graphElem._preloadError = 'No data';
      this._graphElem.innerHTML = '<div style="padding:8px;color:#c00;">No data</div>';
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
    const alertArrowTop = Math.round(size * 1.071);
    const alertArrowRight = Math.round(size * 0.414);
    const alertArrowFontSize = Math.round(size * 0.343);
    const alertSignal = this.alert
      ? `
      .arrow-indicator::after {
        display: block;
        content: "⇲";
        font-size: ${alertArrowFontSize}px;
        color: #ffffff;
        position: relative;
        top: ${alertArrowTop}px;
        right: ${alertArrowRight}px;
        z-index: 4;
        transform: rotate(90deg);
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
          margin-top: ${Math.round(size * 0.12) + ((this.rotation !== 0 && this.rotation !== 180 && this.rotation !== 'off') ? -10 : 0)}px;
          z-index: 100;
        }
        
        #mini-graph-slot > * {
          pointer-events: auto;
        }

        .inner-border {
          position: absolute;
          inset: 0;
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
          border-radius: ${this.theme === 'error' ? borderRadius + 'px' : 'unset'};
          padding: ${this.theme === 'error' ? '0px ' + (0.5 * borderRadius).toString() + 'px' : '0'};
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
      console.log('[CircleTrendicator] Passing benchmark-high:', high, 'benchmark-low:', low);
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
      low: {
        fg: '#ffffff',
        bg: '#f43c44',
        ind: '#909090',
        alert: '#cc6060',
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
