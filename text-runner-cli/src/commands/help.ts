import * as color from "colorette"
import { EventEmitter } from "events"
import { promises as fs } from "fs"
import * as path from "path"
import * as tr from "text-runner-core"

export class HelpCommand implements tr.commands.Command {
  emitter: EventEmitter

  constructor() {
    this.emitter = new EventEmitter()
  }

  async execute(): Promise<void> {
    this.emit("output", await this.template())
  }

  emit(name: tr.events.Name, payload: tr.events.Args): void {
    this.emitter.emit(name, payload)
  }

  /** provides the text to print */
  async template(): Promise<string> {
    const fileContent = await fs.readFile(path.join(__dirname, "../../package.json"), "utf-8")
    const pkg = JSON.parse(fileContent)

    return `
${color.dim(`TextRunner ${pkg.version}`)}

USAGE: ${color.bold("text-run [<options>] <command>")}

COMMANDS
  ${color.bold("run")} [<filename>]         runs all tests on the given file/folder or entire documentation
  ${color.bold("dynamic")} [<filename>]     runs only the programmatic tests, skips checking links
  ${color.bold("static")} [<filename>]      checks only the links, skips programmatic tests

  ${color.bold("setup")}                    creates an example configuration file
  ${color.bold("scaffold")} [--ts] <name>   scaffolds a new region type handler (--ts = in TypeScript)
  ${color.bold("unused")} <filename>        shows unused custom activities

  ${color.bold("help")}                     shows this help screen
  ${color.bold("version")}                  shows the currently installed version
  ${color.bold("debug")}                    shows debug data

OPTIONS
  ${color.bold("--config")}                 provide a custom configuration filename
  ${color.bold("--online")}                 check external links
`
  }

  on(name: tr.events.Name, handler: tr.events.Handler): this {
    this.emitter.on(name, handler)
    return this
  }
}
