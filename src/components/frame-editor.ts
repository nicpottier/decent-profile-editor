import {
  LitElement,
  html,
  customElement,
  property,
  css,
  query,
} from 'lit-element';
import {TargetType, TriggerOperator, Trigger, TriggerType} from '../types';

function incr(x: number): number {
  return x + 1;
}

function decr(x: number): number {
  return x - 1;
}

@customElement('frame-editor')
export class FrameEditor extends LitElement {
  static styles = css`
    .container {
    }

    .inline {
      float: right;
      display: none;
      margin-top: -13px;
      margin-right: 10px;
    }

    .inline > button {
      background: white;
      text-align: center;
      height: 30px;
      width: 30px;
      display: inline-flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      line-height: 20px;
      font-size: 20px;
      font-weight: bold;
      border-radius: 100%;
    }

    .container:hover > .inline {
      display: inline;
    }

    .container:hover {
      background: #fafafa;
    }

    .controls {
      margin-top: 10px;
      display: flex;
    }

    .block {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 125px;
      width: 125px;
      font-size: 36px;
      font-weight: bold;
      color: white;
      text-align: center;
      color: white;
    }

    .tap {
      font-size: 24px;
      flex-grow: 1;
      cursor: pointer;
      color: rgba(255, 255, 255, 0);
      user-select: none;
      flex-grow: 1;
      line-height: 36px;
    }

    .tap:hover {
      color: rgba(255, 255, 255, 0.5);
    }

    .value {
      user-select: none;
      line-height: 36px;
      font-size: 36px;
    }

    .temp {
      background: #f26419;
    }

    .duration {
      background: #333;
    }

    .flow {
      background: #33658a;
    }

    .pressure {
      background: #2a9d8f;
    }

    .unit {
      font-size: 18px;
    }

    .target {
      cursor: pointer;
    }

    .trigger {
      background: #9e2a2b;
    }

    .clickable {
      cursor: pointer;
    }

    .trigger.none {
      background: #333;
      width: 375px;
    }
  `;

  @property({type: Number})
  index: number = 0;

  @property({type: Boolean})
  editName: boolean = false;

  @property()
  name: string = '';

  @property({type: Number})
  temp = 98.4;

  @property({type: Number})
  duration = 10;

  @property()
  targetType: TargetType = TargetType.Flow;

  @property({type: Number})
  targetValue = 12.13;

  @property({type: Boolean})
  targetInterpolate = false;

  @property({type: Boolean})
  showTrigger: boolean = false;

  @property()
  triggerType = TriggerType.Flow;

  @property({type: Number})
  triggerValue = 0;

  @property()
  triggerOperator = TriggerOperator.GreaterThan;

  @query('#targetType')
  _targetType!: HTMLSelectElement;

  @query('#triggerType')
  _triggerType!: HTMLSelectElement;

  @query('#triggerOperator')
  _triggerOperator!: HTMLSelectElement;

  @query('#name')
  _name!: HTMLInputElement;

  get _tempTemplate() {
    return html`
      <div class="block temp">
        <div class="tap" @click="${() => this._update({temp: incr})}">
          &#9650;
        </div>
        <div class="value">${this.temp}°C</div>
        <div class="tap" @click="${() => this._update({temp: decr})}">
          &#9660;
        </div>
      </div>
    `;
  }

  get _durationTemplate() {
    return html`
      <div class="block duration">
        <div class="tap" @click="${() => this._update({duration: incr})}">
          &#9650;
        </div>
        <div class="value">${this.duration}s</div>
        <div class="tap" @click="${() => this._update({duration: decr})}">
          &#9660;
        </div>
      </div>
    `;
  }

  get _targetTemplate() {
    return html`
      <div
        class="block target clickable ${this.targetType}"
        @click=${this._toggleType}
      >
        <div class="value">
          ${this.targetType == TargetType.Flow
            ? html`flow`
            : html`<div>pres</div>
                <div>sure</div>`}
        </div>
      </div>
      <div class="block ${this.targetType}">
        <div
          class="tap"
          @click="${() => this._update({target: {value: incr}})}"
        >
          &#9650;
        </div>
        <div class="value">
          ${this.targetValue}
        </div>
        <div class="unit">
          ${this.targetType == TargetType.Flow ? 'ml/s' : 'bar'}
        </div>
        <div
          class="tap"
          @click="${() => this._update({target: {value: decr}})}"
        >
          &#9660;
        </div>
      </div>
      <div
        class="block clickable ${this.targetType}"
        @click=${this._toggleInterpolate}
      >
        <div class="value">
          ${this.targetInterpolate ? html`slow` : html`fast`}
        </div>
      </div>
    `;
  }

  get _triggerTemplate() {
    if (!this.showTrigger) {
      return html`
        <div class="block trigger none clickable" @click=${this._toggleTrigger}>
          <div class="value">no trigger</div>
        </div>
      `;
    }

    return html`
      <div
        class="block trigger ${this.showTrigger
          ? this.triggerType
          : html`none`}"
        @click=${this._toggleTrigger}
      >
        <div class="value clickable">
          ${this.triggerType == TriggerType.Pressure
            ? html`<div>pres</div>
                <div>sure</div>`
            : html`flow`}
        </div>
      </div>
      <div class="block trigger" @click=${this._toggleTriggerOperator}>
        <div class="value clickable">
          ${this.triggerOperator == TriggerOperator.GreaterThan
            ? html`&gt;`
            : html`&lt;`}
        </div>
      </div>
      <div class="block trigger">
        <div
          class="tap"
          @click="${() => this._update({trigger: {value: incr}})}"
        >
          &#9650;
        </div>
        <div class="value">${this.triggerValue}</div>
        <div class="unit">
          ${this.triggerType == TriggerType.Flow ? 'ml/s' : 'bar'}
        </div>
        <div
          class="tap"
          @click="${() => this._update({trigger: {value: incr}})}"
        >
          &#9660;
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div class="container">
        <div class="controls">
          ${this._durationTemplate} ${this._tempTemplate}${this._targetTemplate}
          ${this._triggerTemplate}
        </div>
      </div>
    `;
  }

  _toggleType() {
    this._update({
      target: {
        type:
          this.targetType == TargetType.Flow
            ? TargetType.Pressure
            : TargetType.Flow,
      },
    });
  }

  _toggleTrigger() {
    this._update({
      trigger: (t: Trigger) => {
        if (t) {
          if (t.type == TriggerType.Flow) {
            t.type = TriggerType.Pressure;
            return t;
          } else {
            return null;
          }
        } else {
          return {
            type: TriggerType.Flow,
            value: 4,
            operator: TriggerOperator.GreaterThan,
          };
        }
      },
    });
  }

  _toggleTriggerOperator() {
    this._update({
      trigger: (t: Trigger) => {
        if (t) {
          t.operator =
            t.operator == TriggerOperator.GreaterThan
              ? TriggerOperator.LessThan
              : TriggerOperator.GreaterThan;
          return t;
        } else {
          return null;
        }
      },
    });
  }

  _toggleInterpolate() {
    this._update({
      target: {
        interpolate: (v: boolean) => !v,
      },
    });
  }

  _update(patch: Object) {
    this.dispatchEvent(
      new CustomEvent('frame-update', {detail: {index: this.index, ...patch}})
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'frame-editor': FrameEditor;
  }
}
