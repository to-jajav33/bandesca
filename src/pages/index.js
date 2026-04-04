import * as template from "./index.html" with { type: "text" };

export function getMetaTags() {
  return {
    title: "Bandesca",
    description: "Bandesca is a platform for creating and sharing music",
  };
}

export default async function render({ request, props }) {
  return template.default;
}
