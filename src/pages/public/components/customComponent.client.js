import Alpine from "alpinejs";

let domParser = null;

/** Shadow roots ignore document `<link rel="stylesheet">`; mirror those sheets here. */
function ensureDocumentStylesheetsInShadow(shadowRoot) {
  const seen = new Set(
    [...shadowRoot.querySelectorAll("link[rel='stylesheet']")].map(
      (l) => l.href,
    ),
  );
  for (const node of document.querySelectorAll("link[rel='stylesheet']")) {
    if (!(node instanceof HTMLLinkElement) || !node.href) continue;
    if (seen.has(node.href)) continue;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = node.href;
    if (node.crossOrigin) link.crossOrigin = node.crossOrigin;
    shadowRoot.append(link);
    seen.add(link.href);
  }
}

export class CustomComponent extends HTMLElement {
  static templateStringCache = "";
  data = {}; // override this in the constructor of the subclass

  constructor() {
    super();

    if (!this.constructor.templateStringCache) {
      throw new Error(
        `Template string not defined for ${this.constructor.name}`,
      );
    }

    // x-data is evaluated as JS; UUIDs are invalid identifiers/expressions (digits, `-`).
    const key = `_${crypto.randomUUID().replace(/-/g, "_")}`;

    Alpine.data(key, () => this.data);
    this.setAttribute("x-data", key);
    this.setAttribute("x-key", key);

    const shadowRoot = this.attachShadow({ mode: "open" });
    const template = domParser
      .parseFromString(this.constructor.templateStringCache, "text/html")
      .querySelector("template");
    shadowRoot.append(template.content.cloneNode(true));

    ensureDocumentStylesheetsInShadow(this.shadowRoot);

    const run = () => {
      const Alpine = globalThis.Alpine;
      if (!Alpine) return;

      // `onAttributesAdded` can run the x-data directive when `x-data` is set in
      // the constructor; that sets `_x_dataStack` but not `_x_marker` (only
      // initTree’s walk sets the marker). Calling initTree again would run x-data
      // twice and re-inject magics on the same `data` object → $nextTick error.
      if (!this._x_marker && !this._x_dataStack) {
        Alpine.initTree(this);
      }

      Alpine.initTree(this.shadowRoot);
    };

    // Run after the current task’s microtasks so MutationObserver has delivered
    // attribute mutations (x-data from setAttribute) before we decide whether to
    // init the host.
    if (globalThis.Alpine) {
      setTimeout(run, 0);
    } else {
      document.addEventListener(
        "alpine:initialized",
        () => {
          setTimeout(run, 0);
        },
        { once: true },
      );
    }
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
