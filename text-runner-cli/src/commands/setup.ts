import * as color from "colorette"
import { createConfigurationFile } from "../config-file/create-configuration-file"
import { EventEmitter } from "events"
import { CommandEvent, Command, Configuration } from "text-runner-core"

export class SetupCommand extends EventEmitter implements Command {
  config: Configuration

  constructor(config: Configuration) {
    super()
    this.config = config
  }

  async execute() {
    await createConfigurationFile(this.config.sourceDir || ".")
    this.emit(CommandEvent.output, `Created configuration file ${color.cyan("text-run.yml")} with default values`)
  }
}