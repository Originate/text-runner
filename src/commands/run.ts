import color from "colorette"
import rimraf from "rimraf"
import util from "util"
import { extractActivities } from "../activity-list/extract-activities"
import { extractImagesAndLinks } from "../activity-list/extract-images-and-links"
import { Configuration } from "../configuration/configuration"
import { getFileNames } from "../finding-files/get-filenames"
import { findLinkTargets } from "../link-targets/find-link-targets"
import { readAndParseFile } from "../parsers/read-and-parse-file"
import { executeParallel } from "../runners/execute-parallel"
import { executeSequential } from "../runners/execute-sequential"
import { StatsCounter } from "../runners/stats-counter"
import { createWorkingDir } from "../working-dir/create-working-dir"

export async function runCommand(config: Configuration): Promise<Error[]> {
  const stats = new StatsCounter()

  // step 0: create working dir
  if (!config.workspace) {
    config.workspace = await createWorkingDir(config.useSystemTempDirectory)
  }

  // step 1: find files
  const filenames = await getFileNames(config)
  if (filenames.length === 0) {
    console.log(color.magenta("no Markdown files found"))
    return []
  }

  // step 2: read and parse files
  const ASTs = await Promise.all(filenames.map(readAndParseFile))

  // step 3: find link targets
  const linkTargets = findLinkTargets(ASTs)

  // step 4: extract activities
  const activities = extractActivities(ASTs, config.classPrefix)
  const links = extractImagesAndLinks(ASTs)
  if (activities.length === 0 && links.length === 0) {
    console.log(color.magenta("no activities found"))
    return []
  }

  // step 5: execute the ActivityList
  const formatter = new config.FormatterClass(
    activities.length + links.length,
    config
  )
  process.chdir(config.workspace)
  const jobs = executeParallel(links, linkTargets, config, stats, formatter)
  jobs.push(
    executeSequential(activities, config, linkTargets, stats, formatter)
  )
  const results = (await Promise.all(jobs)).filter(r => r) as Error[]

  // step 6: cleanup
  process.chdir(config.sourceDir)
  if (results.length === 0 && !config.keepTmp) {
    // NOTE: calling fs.remove causes an exception on Windows here
    const rimrafp = util.promisify(rimraf)
    await rimrafp(config.workspace, { maxBusyTries: 20 })
  }

  // step 7: write stats
  let text = "\n"
  let colorFn
  if (results.length === 0) {
    colorFn = color.green
    text += color.green("Success! ")
  } else {
    colorFn = color.red
    text += color.red(`${results.length} errors, `)
  }
  text += colorFn(
    `${activities.length + links.length} activities in ${
      filenames.length
    } files`
  )
  text += colorFn(`, ${stats.duration()}`)
  console.log(color.bold(text))
  return results
}
