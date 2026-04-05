import { CustomComponent } from "../customComponent.client";
import * as template from "./musicTrackInfiniteScroll.dep.html" with { type: "text" };
import * as musicTrackInfiniteScrollCss from "./musicTrackInfiniteScroll.dep.module.css" with { type: "css" };

export class MusicTrackInfiniteScroll extends CustomComponent {
  data = {
    css: musicTrackInfiniteScrollCss,
  };

  constructor() {
    super();

    this.handleScroll = this.handleScroll.bind(this);
    const contentContainer = this.shadowRoot.querySelector(
      "[ref='contentContainer']",
    );
    contentContainer.addEventListener("scroll", this.handleScroll);
  }

  connectedCallback() {
    requestAnimationFrame(() => {
      this.handleScroll();
    });
  }

  handleScroll() {
    // add an inset shadow on right if scrollable to the right to the right of the content
    const contentContainer = this.shadowRoot.querySelector(
      "[ref='contentContainer']",
    );

    const insetBlur = 10;
    let left = 0;
    let right = 0;
    let top = 0;
    let bottom = 0;
    let offsetFactor = 0.75;

    if (contentContainer.scrollTop > 0) {
      top = insetBlur * offsetFactor;
    }
    if (
      contentContainer.scrollHeight - contentContainer.scrollTop >
      contentContainer.clientHeight
    ) {
      bottom = -insetBlur * offsetFactor;
    }
    if (contentContainer.scrollLeft > 0) {
      left = insetBlur * offsetFactor;
    }
    if (
      contentContainer.scrollWidth - contentContainer.scrollLeft >
      contentContainer.clientWidth
    ) {
      right = -insetBlur * offsetFactor;
    }

    contentContainer.style.boxShadow = `inset ${left}px 0 ${insetBlur}px -${insetBlur}px var(--primary-color),
    inset ${right}px 0 ${insetBlur}px -${insetBlur}px var(--primary-color),
    inset ${top}px 0 ${insetBlur}px -${insetBlur}px var(--primary-color),
    inset ${bottom}px 0 ${insetBlur}px -${insetBlur}px var(--primary-color)`;
  }
}

MusicTrackInfiniteScroll.define(template.default);
