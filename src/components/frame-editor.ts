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
    :host {
      display: block;
      background: #fafafa;
      padding: 20px;
      border: 1px solid #666;
      margin-top: 10px;
    }

    .controls {
      margin-top: 10px;
      display: flex;
    }

    .temp {
      margin-right: 40px;
    }

    .target {
      margin-right: 40px;
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

  get _nameTemplate() {
    if (this.editName) {
      return html`
        <input type="text" id="name" value="${this.name}" />
        <button
          @click="${() => {
            this._update({name: this._name.value});
            this._toggleEditName();
          }}"
        >
          ok
        </button>
      `;
    } else {
      return html`
        <b @click="${this._toggleEditName}"
          >${this.name == '' ? 'undefined' : this.name}</b
        >
      `;
    }
  }

  get _tempTemplate() {
    return html`
      <div>
        <button @click="${() => this._update({temp: decr})}">-</button>
        <b>Temp: </b>${this.temp}
        <button @click="${() => this._update({temp: incr})}">+</button>
      </div>
    `;
  }

  get _durationTemplate() {
    return html`
      <div>
        <button @click="${() => this._update({duration: decr})}">-</button>
        <b>Duration: </b>${this.duration}s
        <button @click="${() => this._update({duration: incr})}">+</button>
      </div>
    `;
  }

  get _triggerTemplate() {
    let toggleTemplate = html` <div>
      <input
        type="checkbox"
        .checked=${this.showTrigger}
        @change="${this._toggleTrigger}"
      />
      Trigger
    </div>`;

    if (!this.showTrigger) {
      return toggleTemplate;
    }

    return html`
      ${toggleTemplate}
      <div style="display:flex;">
        <div>
          <select
            id="triggerType"
            @change="${() =>
              this._update({trigger: {type: this._triggerType.value}})}"
          >
            <option value="${TriggerType.Flow}">${TriggerType.Flow}</option>
            <option value="${TriggerType.Pressure}"
              >${TriggerType.Pressure}</option
            >
          </select>
        </div>
        <div>
          <select
            id="triggerOperator"
            @change="${() =>
              this._update({trigger: {operator: this._triggerOperator.value}})}"
          >
            <option value="${TriggerOperator.GreaterThan}">Is Above</option>
            <option value="${TriggerOperator.LessThan}">Is Below</option>
          </select>
        </div>
        <div>
          <button @click="${() => this._update({trigger: {value: decr}})}">
            -
          </button>
          ${this.triggerValue}
          ${this.triggerType == TriggerType.Flow ? 'ml/s' : 'bar'}
          <button @click="${() => this._update({trigger: {value: incr}})}">
            +
          </button>
        </div>
      </div>
    `;
  }

  get _targetTemplate() {
    return html`
      <div><b>Target</b></div>
      <div>
        <select
          id="targetType"
          @change="${() =>
            this._update({target: {type: this._targetType.value}})}"
        >
          <option value="${TargetType.Flow}">${TargetType.Flow}</option>
          <option value="${TargetType.Pressure}">${TargetType.Pressure}</option>
        </select>
      </div>
      <div>
        <button @click="${() => this._update({target: {value: decr}})}">
          -
        </button>
        ${this.targetValue}
        ${this.targetType == TargetType.Flow ? 'ml/s' : 'bar'}
        <button @click="${() => this._update({target: {value: incr}})}">
          +
        </button>
      </div>

      <div>
        <input
          type="checkbox"
          .checked=${this.targetInterpolate}
          @change="${() =>
            this._update({target: {interpolate: (v: boolean) => !v}})}"
        />
        Interpolate
      </div>
    `;
  }

  render() {
    return html`
      ${this._nameTemplate}
      <div class="controls">
        <div class="temp">${this._tempTemplate} ${this._durationTemplate}</div>
        <div class="target">${this._targetTemplate}</div>
        <div class="trigger">${this._triggerTemplate}</div>
      </div>
    `;
  }

  _toggleEditName() {
    this.editName = !this.editName;
    this.requestUpdate();
  }

  _update(patch: Object) {
    this.dispatchEvent(
      new CustomEvent('frame-update', {detail: {index: this.index, ...patch}})
    );
  }

  _toggleTrigger() {
    this.showTrigger = !this.showTrigger;
    this._update({trigger: this._buildTrigger()});
  }

  _buildTrigger(): Trigger | null {
    if (!this.showTrigger) {
      return null;
    }

    return {
      type: TriggerType.Flow,
      value: 4,
      operator: TriggerOperator.GreaterThan,
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'frame-editor': FrameEditor;
  }
}
