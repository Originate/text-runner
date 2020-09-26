import { Publications } from "./publications"
import { Data } from "./data"

/** provides the default configuration values to use when no values are provided via CLI or config file */
export function defaults(): Data {
  return {
    regionMarker: "type",
    defaultFile: "",
    emptyWorkspace: true,
    exclude: [],
    files: "**/*.md",
    online: false,
    publications: new Publications(),
    scaffoldLanguage: "js",
    sourceDir: process.cwd(),
    systemTmp: false,
    workspace: "", // will be populated later
  }
}
