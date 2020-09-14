import {LitElement, html, customElement, css} from 'lit-element';
import {ProfileChart} from './profile-chart';
import {FrameEditor} from './frame-editor';
import {Profile, TargetType, FrameUpdate} from '../types';
import {ifDefined} from 'lit-html/directives/if-defined';
import merge from 'mergerino';
import {EditableText} from './editable-text';

@customElement('profile-editor')
export class ProfileEditor extends LitElement {
  static styles = css`
    h2 {
      margin-top: 0px;
    }

    .profile-editor {
      max-width: 1024px;
      margin-left: auto;
      margin-right: auto;
      background: white;
      padding: 20px;
    }

    .top {
      display: flex;
    }

    .left {
      flex-grow: 1;
    }
    .right {
      width: 300px;
      padding: 0px 10px;
    }

    .step {
      border: 1px solid gray;
      padding: 5px;
    }
  `;

  private _profile: Profile = {
    name: 'New Profile',
    description: 'A simple profile that sends water out the portafilter bit.',
    author: 'Nobody of Note',
    frames: [
      {
        name: 'Infuse',
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

  frameUpdated(e: CustomEvent<FrameUpdate>) {
    console.log(e.detail);
    this._profile.frames[e.detail.index] = merge(
      this._profile.frames[e.detail.index],
      e.detail.frame
    );
    this._currentFrame = e.detail.index;
    this.requestUpdate();
  }

  _addFrame(_: Event) {
    console.log('frame added');
    this._profile.frames.push({
      name: 'Brew',
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
        <div class="top">
          <div class="left">
            <profile-chart
              width="800"
              height="400"
              .highlight=${this.highlight()}
              .profile=${this._profile}
            ></profile-chart>
          </div>
          <div class="right">
            <div class="metadata">
              <h2>${this._profile.name}</h2>
              ${this._profile.description}
            </div>
            <div class="steps">
              <button style="float:right;" @click=${this._addFrame}>+</button>
              <h3>Steps</h3>
              ${this._profile.frames.map((frame, _) => {
                return html`<div class="step">${frame.name}</div>`;
              })}
            </div>
          </div>
        </div>
        <div class="bottom">
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
                ?showtrigger="${frame.trigger != null}"
                triggerType="${ifDefined(frame.trigger?.type)}"
                triggerValue="${ifDefined(frame.trigger?.value)}"
                triggerOperator="${ifDefined(frame.trigger?.operator)}"
                @frame-update=${this.frameUpdated}
              ></frame-editor>`;
            })}
          </div>
          <pre>${JSON.stringify(this._profile, null, '  ')}</pre>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'editable-text': EditableText;
    'frame-editor': FrameEditor;
    'profile-editor': ProfileEditor;
    'profile-chart': ProfileChart;
  }
}
