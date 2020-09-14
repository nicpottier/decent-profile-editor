import {LitElement, html, customElement, property, css} from 'lit-element';

@customElement('editable-text')
export class EditableText extends LitElement {
  static styles = css`
    .pencil {
      display: none;
    }

    .editable:hover {
      cursor: default;
    }

    .editable:hover > .pencil {
      display: inline;
    }
  `;

  @property()
  text: string = '';

  @property({type: Boolean})
  editing: boolean = false;

  render() {
    if (this.editing) {
      return html` <div>
        <input type="text" value="${this.text}" />
        <button
          @click="${() => {
            this.editing = false;
          }}"
        >
          ok
        </button>
      </div>`;
    } else {
      return html` <div class="editable" @click=${() => (this.editing = true)}>
        ${this.text}
        <span class="pencil">✏️</span>
      </div>`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'editable-text': EditableText;
  }
}
