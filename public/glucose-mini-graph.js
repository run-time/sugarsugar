// Simple inline graph for glucose readings
const COLORS = {
  bg: '#111',
  title: '#fff',
  high: '#ffd600',
  low: '#e53935',
  default: '#469dea',
  tooltipBg: '#111',
  tooltipText: '#fff',
};

class GlucoseMiniGraph extends HTMLElement {
  constructor() {
    super();
    this._displayWindowOptions = [2, 4, 6, 8];
    this._displayWindowIdx = 0;
  }
  // ...existing code...
  connectedCallback() {
    // Use local state for cycling (already set in constructor)
    this._updateDisplayWindow();
    // Guard: only attach one click listener per instance
    if (!this._hasClickListener) {
      this.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window._glucoseFullData && Array.isArray(window._glucoseFullData)) {
          this._displayWindowIdx =
            (this._displayWindowIdx + 1) % this._displayWindowOptions.length;
          this._updateDisplayWindow();
        }
      });
      this._hasClickListener = true;
    }
  }

  _updateDisplayWindow() {
    if (!this._displayWindowOptions || !this._displayWindowOptions.length) {
      this._displayWindowOptions = [2, 4, 6, 8];
    }
    const hours = this._displayWindowOptions[this._displayWindowIdx] || 2;
    this._currentDisplayWindow = hours;
    if (window._glucoseFullData && Array.isArray(window._glucoseFullData)) {
      const now = Date.now();
      const msWindow = hours * 60 * 60 * 1000;
      const filtered = window._glucoseFullData.filter((r) => {
        const t = new Date(r.time).getTime();
        return now - t <= msWindow;
      });
      this.updateData(filtered);
    }
  }

  // Reset cycling to the first option and update data
  resetDisplayWindow() {
    this._displayWindowIdx = 0;
    this._updateDisplayWindow();
  }
  // Allow external update of data (for display window changes)
  updateData(newData) {
    this._data = newData;
    this.render();
    setTimeout(() => this._attachTooltipListeners(), 0);
  }
  static get observedAttributes() {
    return ['benchmark-high', 'benchmark-low', 'rotation'];
  }
  get rotation() {
    const r = this.getAttribute('rotation');
    return r !== null ? Number(r) : 0;
  }

  set data(val) {
    this._data = val;
    this.render();
    setTimeout(() => this._attachTooltipListeners(), 0);
  }

  attributeChangedCallback() {
    this.render();
    setTimeout(() => this._attachTooltipListeners(), 0);
  }

  get benchmarkHigh() {
    let v = this.getAttribute('benchmark-high');
    console.log('[GlucoseMiniGraph] benchmark-high attribute:', v);
    if (v === null || v === undefined) return 180;
    if (typeof v === 'number') return v;
    v = v.trim();
    if (v === '') return 180;
    const num = Number(v);
    console.log(
      '[GlucoseMiniGraph] using benchmarkHigh:',
      isNaN(num) ? 180 : num,
    );
    return isNaN(num) ? 180 : num;
  }
  get benchmarkLow() {
    let v = this.getAttribute('benchmark-low');
    console.log('[GlucoseMiniGraph] benchmark-low attribute:', v);
    if (v === null || v === undefined) return 70;
    if (typeof v === 'number') return v;
    v = v.trim();
    if (v === '') return 70;
    const num = Number(v);
    console.log(
      '[GlucoseMiniGraph] using benchmarkLow:',
      isNaN(num) ? 70 : num,
    );
    return isNaN(num) ? 70 : num;
  }

  render() {
    if (!this._data || this._data.length === 0) {
      this.innerHTML = '<div style="padding:8px;color:#888;">No data</div>';
      return;
    }
    const readings = [...this._data].reverse();
    const width = 160;
    const height = 80;
    const margin = 10;
    const LOW = this.benchmarkLow,
      HIGH = this.benchmarkHigh;
    const min = Math.min(...readings.map((r) => r.value), LOW, HIGH);
    const max = Math.max(...readings.map((r) => r.value), LOW, HIGH);
    const xStep = (width - 2 * margin) / (readings.length - 1);
    const y = (v) =>
      height - margin - ((v - min) / (max - min || 1)) * (height - 2 * margin);
    // ...existing code...
    const lowY = y(LOW);
    const highY = y(HIGH);
    // Show the current display window in the title if available
    // Use the local display window for the header
    const hours =
      this._currentDisplayWindow !== undefined
        ? this._currentDisplayWindow
        : (this._displayWindowOptions && this._displayWindowOptions[0]) || 2;
    const title = `<div style="font-size:13px;font-weight:500;text-align:center;margin-bottom:2px;color:${COLORS.title};">Last ${hours} hour${hours == 1 ? '' : 's'}</div>`;
    let offset = 8;
    if (this.rotation === 180) {
      offset = 40;
    }
    this.innerHTML = `
      <style>
        .mini-graph-bg { fill: #f7f7f7; }
        .mini-graph-dot { fill: ${COLORS.default}; }
        .mini-graph-dot.low { fill: ${COLORS.low}; }
        .mini-graph-dot.high { fill: ${COLORS.high}; }
  .mini-graph-bench-low { stroke: ${COLORS.low}; stroke-width: 1; stroke-dasharray: none; opacity: 0.6; }
  .mini-graph-bench-high { stroke: ${COLORS.high}; stroke-width: 1; stroke-dasharray: none; opacity: 0.6; }
      </style>
  <div style="margin-top: ${offset}px;">
        ${title}
        <svg width="${width}" height="${height}">
          <rect class="mini-graph-bg" x="0" y="0" width="${width}" height="${height}" />
          <!-- Shaded area above high line -->
          <rect x="0" y="0" width="${width}" height="${Math.max(0, highY)}" fill="${COLORS.high}" fill-opacity="0.1" />
          <!-- Shaded area below low line -->
          <rect x="0" y="${Math.min(height, lowY)}" width="${width}" height="${Math.max(0, height - lowY)}" fill="${COLORS.low}" fill-opacity="0.1" />
          <line class="mini-graph-bench-low" x1="0" x2="${width}" y1="${lowY}" y2="${lowY}" />
          <line class="mini-graph-bench-high" x1="0" x2="${width}" y1="${highY}" y2="${highY}" />
          ${readings
            .map((r, i) => {
              let cls = 'mini-graph-dot';
              if (r.value < LOW) cls += ' low';
              else if (r.value > HIGH) cls += ' high';
              return `<circle class="${cls}" cx="${margin + i * xStep}" cy="${y(r.value)}" r="2.6"/>`;
            })
            .join('')}
        </svg>
        <div id="glucose-tooltip" style="display:none;position:absolute;pointer-events:none;z-index:10;"></div>
      </div>
    `;
  }
  _attachTooltipListeners() {
    const svg = this.querySelector('svg');
    const tooltip = this.querySelector('#glucose-tooltip');
    if (!svg || !tooltip) return;
    const points = svg.querySelectorAll('circle');
    const readings = [...this._data].reverse();
    const LOW = this.benchmarkLow,
      HIGH = this.benchmarkHigh;
    points.forEach((pt, i) => {
      pt.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        if (tooltip.style.display === 'block') return; // Already showing
        // Find the corresponding reading
        const r = readings[i];
        if (!r) return;
        const d = new Date(r.time);
        let h = d.getHours();
        let m = d.getMinutes();
        const ampm = h >= 12 ? 'pm' : 'am';
        h = h % 12;
        if (h === 0) h = 12;
        m = m.toString().padStart(2, '0');
        const timeStr = `${h}:${m}${ampm}`;
        let color = COLORS.default;
        let valueDisplay = r.value;
        if (r.value === 39) {
          valueDisplay = 'LOW';
        } else if (r.value === 401) {
          valueDisplay = 'HIGH';
        }
        if (r.value < LOW) color = COLORS.low;
        else if (r.value > HIGH) color = COLORS.high;
        tooltip.innerHTML =
          `<span style="background:${COLORS.tooltipBg};color:${COLORS.tooltipText};padding:2px 7px 2px 7px;font-size:13px;white-space:nowrap;display:inline-block;">` +
          `<span style='color:${COLORS.tooltipText};'>${timeStr}</span>&nbsp;` +
          `<span style="font-weight:bold;color:${color}">${valueDisplay}</span></span>`;
        tooltip.style.display = 'block';
        const rect = pt.getBoundingClientRect();
        const parentRect = this.getBoundingClientRect();
        tooltip.style.left = `${rect.left - parentRect.left - 18}px`;
        tooltip.style.top = `${rect.top - parentRect.top - 32}px`;
      });
      pt.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
    });
  }
}
customElements.define('glucose-mini-graph', GlucoseMiniGraph);
