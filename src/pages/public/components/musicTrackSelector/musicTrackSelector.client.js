import { CustomComponent } from "../customComponent.client";
import * as template from "./musicTrackSelector.dep.html" with { type: "text" };
import * as musicTrackSelectorCss from "./musicTrackSelector.dep.module.css" with { type: "css" };

export class MusicTrackSelector extends CustomComponent {
  data = {
    css: musicTrackSelectorCss,
    types: ["midi", "audio", "voice"],
    // Avoid a `selectedType` key here — merged scope with parent would capture writes.
    handleSelect: function (type) {
      this.$dispatch("typeselected", { type });
    },
  };

  constructor() {
    super();
  }
}

MusicTrackSelector.define(template.default);
