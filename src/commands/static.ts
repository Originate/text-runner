import color from "colorette"
import fs from "fs-extra"
import { extractImagesAndLinks } from "../activity-list/extract-images-and-links"
import { instantiateFormatter } from "../configuration/instantiate-formatter"
import { Configuration } from "../configuration/types/configuration"
import { getFileNames } from "../filesystem/get-filenames"
import { findLinkTargets } from "../link-targets/find-link-targets"
import { MdParser } from "../parsers/markdown/md-parser"
import { executeParallel } from "../runners/execute-parallel"
import { StatsCounter } from "../runners/helpers/stats-counter"
import { createWorkingDir } from "../working-dir/create-working-dir"

export async function staticCommand(config: Configuration): Promise<Error[]> {
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
  const parser = new MdParser()
  const ASTs = await parser.parseFiles(filenames)

  // step 3: find link targets
  const linkTargets = findLinkTargets(ASTs)

  // step 4: extract activities
  const links = extractImagesAndLinks(ASTs)
  if (links.length === 0) {
    console.log(color.magenta("no activities found"))
    return []
  }

  // step 5: execute the ActivityList
  const formatter = instantiateFormatter(
    config.formatterName,
    links.length,
    config
  )
  process.chdir(config.workspace)
  const jobs = executeParallel(links, linkTargets, config, stats, formatter)
  const results = (await Promise.all(jobs)).filter(r => r) as Error[]

  // step 6: cleanup
  process.chdir(config.sourceDir)
  if (results.length === 0 && !config.keepTmp) {
    await fs.remove(config.workspace)
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
  text += colorFn(`${links.length} activities in ${filenames.length} files`)
  text += colorFn(`, ${stats.duration()}`)
  console.log(color.bold(text))
  return results
}
