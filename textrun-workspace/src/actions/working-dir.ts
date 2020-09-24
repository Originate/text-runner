import * as color from "colorette"
import * as path from "path"
import * as tr from "text-runner-core"

/** The "cd" action changes the current working directory to the one given in the hyperlink or code block. */
export function workingDir(action: tr.actions.Args): void {
  const directory = action.region.text()
  action.name(`changing into the ${color.cyan(directory)} directory`)
  const fullPath = path.join(action.configuration.workspace, directory)
  action.log(`cd ${fullPath}`)
  try {
    process.chdir(fullPath)
  } catch (e) {
    if (e.code === "ENOENT") {
      throw new Error(`directory ${directory} not found`)
    }
    throw e
  }
}
