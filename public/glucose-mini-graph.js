// Simple inline graph for glucose readings
const COLORS = {
  bg: '#111',
  title: '#fff',
  high: '#ffd600',
  highStroke: '#bfa000',
  low: '#e53935',
  lowStroke: '#b00020',
  default: '#469dea',
  defaultStroke: '#266dba',
  tooltipBg: '#111',
  tooltipText: '#fff',
};

class GlucoseMiniGraph extends HTMLElement {
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
    console.log('[GlucoseMiniGraph] using benchmarkHigh:', isNaN(num) ? 180 : num);
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
    console.log('[GlucoseMiniGraph] using benchmarkLow:', isNaN(num) ? 70 : num);
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
    const LOW = this.benchmarkLow, HIGH = this.benchmarkHigh;
    const min = Math.min(...readings.map(r => r.value), LOW, HIGH);
    const max = Math.max(...readings.map(r => r.value), LOW, HIGH);
    const xStep = (width - 2 * margin) / (readings.length - 1);
    const y = v => height - margin - ((v - min) / (max - min || 1)) * (height - 2 * margin);
    const points = readings.map((r, i) => ({
      x: margin + i * xStep,
      y: y(r.value),
      value: r.value
    }));
    const lowY = y(LOW);
    const highY = y(HIGH);
    let hours = 2;
    if (readings.length > 1) {
      const t0 = new Date(readings[0].time).getTime();
      const tN = new Date(readings[readings.length-1].time).getTime();
      const mins = Math.abs(t0-tN)/1000/60;
      if (mins >= 60) {
        hours = Math.round(mins/60);
      } else {
        hours = Math.max(+(mins/60).toFixed(1), 1.0);
      }
    }
    const title = `<div style="font-size:13px;font-weight:500;text-align:center;margin-bottom:2px;color:${COLORS.title};">Last ${hours} hour${hours==1?"":"s"}</div>`;
    // Adjust vertical offset based on rotation: if not 0 or 180, move up by 10px
    const offset = (this.rotation !== 0 && this.rotation !== 180) ? -10 : 0;
    this.innerHTML = `
      <style>
        .mini-graph-bg { fill: #f7f7f7; }
        .mini-graph-dot { fill: ${COLORS.default}; }
        .mini-graph-dot.low { fill: ${COLORS.low}; }
        .mini-graph-dot.high { fill: ${COLORS.high}; stroke: ${COLORS.highStroke}; stroke-width: 1; }
        .mini-graph-bench-low { stroke: ${COLORS.low}; stroke-width: 1.5; stroke-dasharray: 4 2; }
        .mini-graph-bench-high { stroke: ${COLORS.high}; stroke-width: 1.5; stroke-dasharray: 4 2; }
      </style>
      <div style="position:relative; top: ${offset}px;">
        ${title}
        <svg width="${width}" height="${height}">
          <rect class="mini-graph-bg" x="0" y="0" width="${width}" height="${height}" />
          <!-- Shaded area above high line -->
          <rect x="0" y="0" width="${width}" height="${Math.max(0, highY)}" fill="${COLORS.high}" fill-opacity="0.2" />
          <!-- Shaded area below low line -->
          <rect x="0" y="${Math.min(height, lowY)}" width="${width}" height="${Math.max(0, height - lowY)}" fill="${COLORS.low}" fill-opacity="0.2" />
          <line class="mini-graph-bench-low" x1="0" x2="${width}" y1="${lowY}" y2="${lowY}" />
          <line class="mini-graph-bench-high" x1="0" x2="${width}" y1="${highY}" y2="${highY}" />
          ${points.length > 1 ? points.map((pt, i) => {
            if (i === 0) return '';
            const prev = points[i-1];
            let color = COLORS.defaultStroke;
            if (pt.value > HIGH || prev.value > HIGH) color = COLORS.highStroke;
            else if (pt.value < LOW || prev.value < LOW) color = COLORS.lowStroke;
            return `<line x1="${prev.x}" y1="${prev.y}" x2="${pt.x}" y2="${pt.y}" stroke="${color}" stroke-width="2" fill="none" />`;
          }).join('') : ''}
          ${readings.map((r, i) => {
            let cls = 'mini-graph-dot';
            if (r.value < LOW) cls += ' low';
            else if (r.value > HIGH) cls += ' high';
            return `<circle class="${cls}" cx="${margin + i * xStep}" cy="${y(r.value)}" r="2.8"/>`;
          }).join('')}
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
    const LOW = this.benchmarkLow, HIGH = this.benchmarkHigh;
    points.forEach((pt, i) => {
      pt.addEventListener('mouseenter', e => {
        const r = readings[i];
        if (!r) return;
        const d = new Date(r.time);
        let h = d.getHours();
        let m = d.getMinutes();
        let ampm = h >= 12 ? 'pm' : 'am';
        h = h % 12;
        if (h === 0) h = 12;
        m = m.toString().padStart(2, '0');
        const timeStr = `${h}:${m}${ampm}`;
        let color = COLORS.default;
        if (r.value < LOW) color = COLORS.low;
        else if (r.value > HIGH) color = COLORS.high;
        tooltip.innerHTML = `<span style="background:${COLORS.tooltipBg};color:${COLORS.tooltipText};padding:2px 7px 2px 7px;font-size:13px;white-space:nowrap;display:inline-block;">` +
          `<span style='color:${COLORS.tooltipText};'>${timeStr}</span>&nbsp;` +
          `<span style="font-weight:bold;color:${color}">${r.value}</span></span>`;
        tooltip.style.display = 'block';
        const rect = pt.getBoundingClientRect();
        const parentRect = this.getBoundingClientRect();
        tooltip.style.left = (rect.left - parentRect.left - 18) + 'px';
        tooltip.style.top = (rect.top - parentRect.top - 32) + 'px';
      });
      pt.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
    });
  }
}
customElements.define('glucose-mini-graph', GlucoseMiniGraph);
