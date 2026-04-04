import { CustomComponent } from "../customComponent.client";
// Load music-track before holder markup uses <music-track>; do not use <script src> in the
// template — paths resolve from the document URL (/) and Bun cannot rewrite hashed filenames there.
import "../musicTrack/musicTrack.client.js";
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
