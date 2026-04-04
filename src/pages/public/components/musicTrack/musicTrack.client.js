import { CustomComponent } from "../customComponent.client";
import * as template from "./musicTrack.dep.html" with { type: "text" };
import * as musicTrackCss from "./musicTrack.dep.module.css" with { type: "css" };
import "../musicTrackSelector/musicTrackSelector.client.js";

export class MusicTrack extends CustomComponent {
  data = {
    css: musicTrackCss,
    selectedType: "none",
    removeTrack: function () {
      this.selectedType = "none";
      this.$dispatch("remove");
    },
    handleTypeSelect: function (event) {
      this.selectedType = event.detail.type;
      debugger;
      this.$dispatch("type-select", { type: this.selectedType });
    },
  };
  constructor() {
    super();
  }
}

MusicTrack.define(template.default);
