import { CustomComponent } from "../customComponent.client";
import * as template from "./musicTrackInfiniteScroll.dep.html" with { type: "text" };
import * as musicTrackInfiniteScrollCss from "./musicTrackInfiniteScroll.dep.module.css" with { type: "css" };

export class MusicTrackInfiniteScroll extends CustomComponent {
  data = {
    css: musicTrackInfiniteScrollCss,
  };
}

MusicTrackInfiniteScroll.define(template.default);
