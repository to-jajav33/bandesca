let domParser = null;

export class CustomComponent extends HTMLElement {
  static templateStringCache = "";
  constructor() {
    super();

    if (!this.constructor.templateStringCache) {
      throw new Error(
        `Template string not defined for ${this.constructor.name}`,
      );
    }

    // x-data is evaluated as JS; UUIDs are invalid identifiers/expressions (digits, `-`).
    const key = `_${crypto.randomUUID().replace(/-/g, "_")}`;

    Alpine.data(key, () => this);

    this.setAttribute("x-data", key);
    this.setAttribute("x-key", key);

    const template = domParser
      .parseFromString(this.constructor.templateStringCache, "text/html")
      .querySelector("template");
    this.append(template.content.cloneNode(true));
  }

  init() {
    console.log("Custom component initialized");
  }

  static hyphenate(str) {
    str = str.replace(str.charAt(0), str.charAt(0).toLowerCase());
    return str.replace(/([A-Z])/g, "-$1").toLowerCase();
  }

  static get hyphenatedName() {
    return this.hyphenate(this.name);
  }

  static define(templateString) {
    if (globalThis.customElements) {
      domParser = domParser ?? new DOMParser();
      this.templateStringCache = templateString;
      customElements.define(this.hyphenatedName, this);
    }
  }
}
