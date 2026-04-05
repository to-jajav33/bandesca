import { CustomComponent } from "../customComponent.client";
import * as template from "./musicTrack.dep.html" with { type: "text" };
import * as musicTrackCss from "./musicTrack.dep.module.css" with { type: "css" };
import "../musicTrackSelector/musicTrackSelector.client.js";

export class MusicTrack extends CustomComponent {
  data = {
    css: musicTrackCss,
    selectedType: "none",
    setTrackToNone: function () {
      this.selectedType = "none";
    },
    deleteTrack: function () {
      this.$dispatch("remove");
    },
    handleTypeSelected: function (event) {
      this.selectedType = event.detail.type;
    },
  };
  constructor() {
    super();
  }
}

MusicTrack.define(template.default);
