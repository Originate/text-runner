import * as color from "colorette"
import { extractImagesAndLinks } from "../activity-list/extract-images-and-links"
import { instantiateFormatter } from "../configuration/instantiate-formatter"
import { getFileNames } from "../filesystem/get-filenames"
import { findLinkTargets } from "../link-targets/find-link-targets"
import { parseMarkdownFiles } from "../parsers/markdown/parse-markdown-files"
import { executeParallel } from "../runners/execute-parallel"
import { StatsCounter } from "../runners/helpers/stats-counter"
import { createWorkspace } from "../working-dir/create-working-dir"
import { ActionFinder } from "../actions/action-finder"
import { loadConfiguration } from "../configuration/load-configuration"
import { UserProvidedConfiguration } from "../configuration/types/user-provided-configuration"

export async function staticCommand(cmdlineArgs: UserProvidedConfiguration): Promise<number> {
  const stats = new StatsCounter()

  // step 1: load configuration from file
  const config = await loadConfiguration(cmdlineArgs)

  // step 2: create working dir
  if (!config.workspace) {
    config.workspace = await createWorkspace(config.useSystemTempDirectory)
  }

  // step 3: find files
  const filenames = await getFileNames(config)
  if (filenames.length === 0) {
    console.log(color.magenta("no Markdown files found"))
    return 0
  }

  // step 4: read and parse files
  const ASTs = await parseMarkdownFiles(filenames)

  // step 5: find link targets
  const linkTargets = findLinkTargets(ASTs)

  // step 6: extract activities
  const links = extractImagesAndLinks(ASTs)
  if (links.length === 0) {
    console.log(color.magenta("no activities found"))
    return 0
  }

  // step 7: find actions
  const actionFinder = ActionFinder.loadStatic()

  // step 8: execute the ActivityList
  const formatter = instantiateFormatter(config.formatterName, links.length, config)
  process.chdir(config.workspace)
  const jobs = executeParallel(links, actionFinder, linkTargets, config, stats, formatter)
  const errors = await Promise.all(jobs)
  const errorCount = errors.reduce((acc, val) => acc + val, 0)

  // step 9: cleanup
  process.chdir(config.sourceDir)

  // step 10: write stats
  if (config.formatterName !== "silent") {
    let text = "\n"
    let colorFn
    if (errorCount === 0) {
      colorFn = color.green
      text += color.green("Success! ")
    } else {
      colorFn = color.red
      text += color.red(`${errorCount} errors, `)
    }
    text += colorFn(`${links.length} activities in ${filenames.length} files`)
    text += colorFn(`, ${stats.duration()}`)
    console.log(color.bold(text))
  }

  return errorCount
}
