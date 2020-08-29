import * as color from "colorette"
import { ActionFinder } from "../actions/action-finder"
import { extractActivities } from "../activity-list/extract-activities"
import { Configuration } from "../configuration/types/configuration"
import { getFileNames } from "../filesystem/get-filenames"
import { parseMarkdownFiles } from "../parsers/markdown/parse-markdown-files"

export async function unusedCommand(config: Configuration): Promise<number> {
  // step 1: find files
  const filenames = await getFileNames(config)
  if (filenames.length === 0) {
    console.log(color.magenta("no Markdown files found"))
    return 0
  }

  // step 2: read and parse files
  const ASTs = await parseMarkdownFiles(filenames)

  // step 3: extract activities
  const usedActivityNames = extractActivities(ASTs, config.regionMarker).map((activity) => activity.actionName)

  // step 4: find defined activities
  const definedActivityNames = ActionFinder.load(config.sourceDir).customActionNames()

  // step 5: identify unused activities
  const unusedActivityNames = definedActivityNames.filter(
    (definedActivityName) => !usedActivityNames.includes(definedActivityName)
  )

  // step 6: write results
  console.log("Unused activities:")
  for (const unusedActivityName of unusedActivityNames) {
    console.log(`- ${unusedActivityName}`)
  }

  return 0
}
