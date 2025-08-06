class CircleTrendicator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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
    ];
  }

  connectedCallback() {
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
        fg: '#884444',
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

  render() {
    const size = this.size;
    const borderWidth = Math.round(size * 0.068);
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
          color: ${this.fgColor};
          z-index: 20;
          position: relative;
          margin: 0;
          margin-top: -2px;
          opacity: 0.5;
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
      
      <div class="container">
        <div class="main-circle">
          <div class="inner-border"></div>
          <div class="value-text">${this.value}</div>
          <div class="trend-text">${this.trend}</div>
        </div>
        ${indicatorArrowElement}
      </div>
    `;
  }
}

customElements.define('circle-trendicator', CircleTrendicator);
