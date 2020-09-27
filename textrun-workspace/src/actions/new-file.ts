import * as color from "colorette"
import * as fs from "fs-extra"
import * as path from "path"
import * as tr from "text-runner-core"

export async function newFile(action: tr.actions.Args): Promise<void> {
  let filePath
  try {
    filePath = action.region.textInNodeOfType("em", "strong")
  } catch (e) {
    const guidance = `Cannot determine the name of the file to create.\n${e.guidance}`
    throw new tr.UserError(e.message, guidance)
  }
  let content
  try {
    content = action.region.textInNodeOfType("fence", "code")
  } catch (e) {
    const guidance = `Cannot determine the content of the file to create.\n${e.guidance}`
    throw new tr.UserError(e.message, guidance)
  }
  action.name(`create file ${color.cyan(filePath)}`)
  const fullPath = path.join(action.configuration.workspace, filePath)
  action.log(`create file ${filePath}`)
  await fs.ensureDir(path.dirname(fullPath))
  await fs.writeFile(fullPath, content)
}
