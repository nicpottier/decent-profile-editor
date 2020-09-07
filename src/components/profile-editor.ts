import {LitElement, html, customElement, css} from 'lit-element';
import {ProfileChart} from './profile-chart';
import {FrameEditor} from './frame-editor';
import {Profile, TargetType, Frame} from '../types';
import {ifDefined} from 'lit-html/directives/if-defined';
import merge from 'mergerino';

@customElement('profile-editor')
export class ProfileEditor extends LitElement {
  static styles = css``;

  private _profile: Profile = {
    name: 'New Profile',
    frames: [
      {
        name: 'Infuse',
        index: 0,
        temp: 90,
        duration: 10,
        target: {
          value: 7,
          type: TargetType.Flow,
          interpolate: false,
        },
      },
    ],
  };

  private _currentFrame = -1;

  frameUpdated(e: CustomEvent<Frame>) {
    console.log(e.detail);
    this._profile.frames[e.detail.index] = merge(
      this._profile.frames[e.detail.index],
      e.detail
    );
    this._currentFrame = e.detail.index;
    this.requestUpdate();
  }

  addFrame() {
    console.log('frame added');
    this._profile.frames.push({
      name: 'Brew',
      index: this._profile.frames.length,
      temp: 90,
      duration: 10,
      target: {
        value: 7,
        type: TargetType.Flow,
        interpolate: false,
      },
    });
    this._currentFrame = this._profile.frames.length - 1;
    this.requestUpdate();
  }

  highlight() {
    if (
      this._currentFrame >= 0 &&
      this._currentFrame < this._profile.frames.length
    ) {
      return this._currentFrame;
    } else {
      return -1;
    }
  }

  render() {
    return html`
      <div class="profile-editor">
        <div>${this._profile.name}</div>
        <profile-chart
          width="800"
          height="400"
          .highlight=${this.highlight()}
          .profile=${this._profile}
        ></profile-chart>
        <button @click=${this.addFrame}>Add Frame</button>
        <div class="frames">
          ${this._profile.frames.map((frame, i) => {
            return html`<frame-editor
              index="${i}"
              name="${frame.name}"
              temp="${frame.temp}"
              duration="${frame.duration}"
              targetValue="${frame.target.value}"
              targetType="${frame.target.type}"
              ?targetinterpolate="${frame.target.interpolate}"
              ?showtrigger="${!frame.trigger === null}"
              triggerType="${ifDefined(frame.trigger?.type)}"
              triggerValue="${ifDefined(frame.trigger?.value)}"
              triggerOperator="${ifDefined(frame.trigger?.operator)}"
              @frame-update=${this.frameUpdated}
            ></frame-editor>`;
          })}
        </div>
        <pre>${JSON.stringify(this._profile, null, '  ')}</pre>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'profile-editor': ProfileEditor;
    'profile-chart': ProfileChart;
    'frame-editor': FrameEditor;
  }
}
