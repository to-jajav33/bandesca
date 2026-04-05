import { CustomComponent } from "../customComponent.client";
import * as template from "./musicTrackTypeMidi.dep.html" with { type: "text" };
import * as musicTrackTypeMidiCss from "./musicTrackTypeMidi.dep.module.css" with { type: "css" };
import "../musicTrackInfiniteScroll/musicTrackInfiniteScroll.client.js";
export class MusicTrackTypeMidi extends CustomComponent {
  data = {
    css: musicTrackTypeMidiCss,
  };
}

MusicTrackTypeMidi.define(template.default);
