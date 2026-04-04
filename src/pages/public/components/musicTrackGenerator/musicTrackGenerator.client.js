import { CustomComponent } from "../customComponent.client.js";
// Load music-track before holder markup uses <music-track>; do not use <script src> in the
// template — paths resolve from the document URL (/) and Bun cannot rewrite hashed filenames there.
import "../musicTrack/musicTrack.client.js";
import * as template from "./musicTrackGenerator.dep.html" with { type: "text" };

export class MusicTrackGenerator extends CustomComponent {
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

MusicTrackGenerator.define(template.default);
