import {
  LitElement,
  html,
  svg,
  customElement,
  css,
  property,
  SVGTemplateResult,
} from 'lit-element';
import {Profile, TargetType, MAX_TEMP, MIN_TEMP} from '../types';

const MAX_Y = 13;
const Y_GRID = 2;
const X_GRID = 5;

@customElement('profile-chart')
export class ProfileChart extends LitElement {
  private _profile: Profile = {name: '', frames: []};
  private _width: number = 800;
  private _height: number = 400;

  private _frameCount: number = 0;
  private _duration: number = 60;
  private _xScale: number = this._width / this._duration;
  private _yScale: number = this.height / Math.max(MAX_Y);
  private _tScale: number = this._height / (MAX_TEMP - MIN_TEMP);

  static styles = css`
    .profile {
      border: #eee 1px solid;
    }

    .x-label {
      font-size: 8pt;
      fill: #aaa;
    }

    .y-label {
      font-size: 8pt;
      fill: #aaa;
    }

    .temp {
      stroke: #f26419;
    }

    .flow {
      stroke: #33658a;
    }

    .pressure {
      stroke: #2a9d8f;
    }

    .highlight {
      fill: rgba(220, 220, 220, 0.25);
    }
  `;

  @property({type: Object})
  get profile(): Object {
    return this._profile;
  }

  set profile(val: Object) {
    this._profile = <Profile>val;
    this._calculateScales();
    this.requestUpdate();
  }

  @property({type: Number})
  highlight = -1;

  @property({type: Number})
  get width(): number {
    return this._width;
  }

  set width(val: number) {
    let old = this._width;
    this._width = val;
    this._calculateScales();
    this.requestUpdate('width', old);
  }

  @property({type: Number})
  get height(): number {
    return this._height;
  }

  set height(val: number) {
    let old = this.height;
    this._height = val;
    this._calculateScales();
    this.requestUpdate('height', old);
  }

  // recalculates our various scale factors based on current duration and SVG size
  _calculateScales() {
    // x scale is based on total shot duration
    let duration = 0;
    this._profile.frames.forEach((f) => {
      duration += f.duration;
    });
    this._duration = duration;
    this._frameCount = this._profile.frames.length;

    // calculate our y scales based on our new width and height
    this._xScale = this._width / this._duration;
    this._yScale = this._height / MAX_Y;
    this._tScale = this._height / (MAX_TEMP - MIN_TEMP);
  }

  // renders our graph grid
  get _gridTemplate() {
    let labels: Array<SVGTemplateResult> = [];

    let xGrid = '';
    for (let x = 0; x < this._duration; x += X_GRID) {
      xGrid += `M${x * this._xScale} 0 V${this._height - 16} `;
      if (x > 0) {
        labels.push(
          svg`
            <text 
              class="x-label" 
              text-anchor="middle" 
              dominant-baseline="central" 
              x="${x * this._xScale}" 
              y="${this._height - 8}"
            >
              ${x}
            </text>`
        );
      }
    }

    let yGrid = '';
    for (let y = 0; y < 15; y += Y_GRID) {
      yGrid += `M24 ${400 - y * this._yScale} H${this._width} `;
      if (y > 0) {
        labels.push(
          svg`
            <text 
              class="y-label" 
              text-anchor="middle" 
              dominant-baseline="central" 
              x="14" 
              y="${this._height - y * this._yScale}"
            >
              ${y}
            </text>`
        );
      }
    }

    return svg`
      <path 
        d="${xGrid} ${yGrid}" 
        stroke="#eee" 
        stroke-width="1"
      ></path>
      ${labels}`;
  }

  // renders the highlighted frame by shading it slightly
  get _renderHighlight() {
    if (this.highlight < 0 || this.highlight >= this._frameCount) {
      return;
    }

    let startX = 0;
    for (let i = 0; i < this.highlight; i++) {
      startX += this._profile.frames[i].duration;
    }
    let width = this._profile.frames[this.highlight].duration;

    return svg`
      <rect 
        class="highlight"
        x=${startX * this._xScale} 
        y=0 
        height="${this.height}" 
        width="${width * this._xScale}" 
      ></rect>
    `;
  }

  // renders all our frames
  get _framesTemplate() {
    let x = 0;
    let lastType = '';
    let lastY = 0;
    let lastTempY = 0;

    let paths: Array<SVGTemplateResult> = [];
    for (let i in this._profile.frames) {
      let frame = this._profile.frames[i];
      let width = frame.duration * this._xScale;
      let y = this._height - frame.target.value * this._yScale;
      let tempY = this._height - (frame.temp - MIN_TEMP) * this._tScale;
      let targetColor = frame.target.type == TargetType.Flow ? 'blue' : 'green';

      // changing types, we don't curve between them
      if (frame.target.type != lastType) {
        paths.push(svg`<path
          class="${frame.target.type}"
          d=${this.line(x, y, x + width, y)}
          stroke-width="4"
          stroke-linecap="round"
          stroke="${targetColor}"
        ></path>`);
      } else {
        paths.push(svg`<path
          class="${frame.target.type}"
          d=${this.curveTo(x, lastY, x + width, y, frame.target.interpolate)}
          stroke-width="4"
          stroke-linecap="round"
          stroke="${targetColor}"
          fill="transparent"
        ></path>`);
      }

      if (lastTempY == 0) {
        paths.push(svg`<path
          class="temp"
          d=${this.line(x, tempY, x + width, tempY)}
          stroke-width="4"
          stroke-linecap="round"
        ></path>`);
      } else {
        paths.push(svg`<path
          class="temp"
          d=${this.curveTo(x, lastTempY, x + width, tempY, false)}
          stroke-linecap="round"
          stroke-width="4"
          fill="transparent"
        ></path>`);
      }
      x += width;
      lastType = frame.target.type;
      lastTempY = tempY;
      lastY = y;
    }

    return paths;
  }

  line(x1: number, y1: number, x2: number, y2: number): string {
    return `M${x1} ${y1} L${x2} ${y2}`;
  }

  curveTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    interpolate: boolean
  ): string {
    if (!interpolate) {
      let c = Math.min(1.5 * this._xScale, (x2 - x1) / 4);
      return `
        M${x1} ${y1} 
        C${x1 + c} ${y1}, ${x1 + c} ${y2}, ${x1 + c * 2} ${y2} 
        L${x2} ${y2}
      `;
    } else {
      let x3 = x2;
      let y3 = y2;
      x2 = x1 + (x2 - x1) / 4;
      y2 = y1 + (y2 - y1) / 4;
      let c = Math.min(1.5 * this._xScale, (x2 - x1) / 4);
      let cX = (x3 - x1) / 8;
      let cY = (y3 - y1) / 8;
      return `
        M${x1} ${y1} 
        C${x1 + c} ${y1}, ${x2 - cX} ${y2 - cY}, ${x2} ${y2} 
        L${x3} ${y3}
      `;
    }
  }

  render() {
    return html`
      <svg class="profile" viewBox="0 0 ${this.width} ${this.height}">
        <rect width="100%" height="100%" fill="white" />
        ${this._gridTemplate} ${this._renderHighlight} ${this._framesTemplate}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'profile-chart': ProfileChart;
  }
}
