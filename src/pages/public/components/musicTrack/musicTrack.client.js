import { CustomComponent } from "../customComponent.client";
import * as template from "./musicTrack.dep.html" with { type: "text" };

export class MusicTrack extends CustomComponent {
  constructor() {
    super();
  }
}

console.log("template", template);
console.log("template.default", template.default);

MusicTrack.define(template.default);
