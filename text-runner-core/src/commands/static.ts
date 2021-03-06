import { EventEmitter } from "events"

import * as actions from "../actions"
import { extractImagesAndLinks } from "../activities/extract-images-and-links"
import * as configuration from "../configuration/index"
import * as events from "../events/index"
import * as files from "../filesystem/index"
import * as linkTargets from "../link-targets"
import * as parser from "../parsers"
import * as run from "../run"
import * as workspace from "../workspace"
import { Command } from "./command"

export class Static implements Command {
  userConfig: configuration.APIData
  emitter: EventEmitter

  constructor(userConfig: configuration.APIData) {
    this.userConfig = userConfig
    this.emitter = new EventEmitter()
  }

  emit(name: events.Name, payload: events.Args): void {
    this.emitter.emit(name, payload)
  }

  async execute(): Promise<void> {
    const originalDir = process.cwd()
    try {
      // step 1: determine full configuration
      const config = await configuration.addDefaults(this.userConfig)

      // step 2: create working dir
      await workspace.create(config)

      // step 3: find files
      const filenames = await files.getFileNames(config)
      if (filenames.length === 0) {
        this.emit("result", { status: "warning", message: "no Markdown files found" })
        return
      }

      // step 4: read and parse files
      const ASTs = await parser.markdown.parse(filenames, config.sourceDir)

      // step 5: find link targets
      const targets = linkTargets.find(ASTs)

      // step 6: extract activities
      const links = extractImagesAndLinks(ASTs)
      if (links.length === 0) {
        this.emit("result", { status: "warning", message: "no activities found" })
        return
      }

      // step 7: find actions
      const actionFinder = await actions.Finder.loadStatic()

      // step 8: execute the ActivityList
      this.emit("start", { stepCount: links.length } as events.Start)
      process.chdir(config.workspace.platformified())
      const parResults = run.parallel(links, actionFinder, targets, config, this)
      await Promise.all(parResults)

      // step 9: cleanup
      process.chdir(config.sourceDir.platformified())
    } finally {
      process.chdir(originalDir)
    }
  }

  on(name: events.Name, handler: events.Handler): this {
    this.emitter.on(name, handler)
    return this
  }
}
