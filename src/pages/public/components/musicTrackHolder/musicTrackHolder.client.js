import { CustomComponent } from "../customComponent.client";
import * as template from "./musicTrackHolder.dep.html" with { type: "text" };

export class MusicTrackHolder extends CustomComponent {
  data = {
    tracks: [{}],
    addTrack: function () {
      this.tracks.push({});
    },
  };

  constructor() {
    super();
  }
}

MusicTrackHolder.define(template.default);
