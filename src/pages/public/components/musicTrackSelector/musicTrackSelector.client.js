import { CustomComponent } from "../customComponent.client";
import * as template from "./musicTrackSelector.dep.html" with { type: "text" };
import * as musicTrackSelectorCss from "./musicTrackSelector.dep.module.css" with { type: "css" };

export class MusicTrackSelector extends CustomComponent {
  data = {
    css: musicTrackSelectorCss,
    types: ["midi", "audio", "voice", "none"],
    selectedType: "midi",
    handleSelect: function (event) {
      this.selectedType = event.detail.type;
      this.$dispatch("select", { type: this.selectedType });
    },
  };

  constructor() {
    super();
  }
}

MusicTrackSelector.define(template.default);
