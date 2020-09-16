import * as progress from "cli-progress"
import * as color from "colorette"
import * as path from "path"
import { Configuration } from "text-runner-core"
import { printCodeFrame } from "../../helpers/print-code-frame"
import { printSummary } from "../print-summary"
import { CommandEvent, StartArgs, FailedArgs } from "text-runner-core"
import { FinishArgs, Formatter } from "../formatter"
import { EventEmitter } from "events"

export class ProgressFormatter implements Formatter {
  private readonly configuration: Configuration
  private readonly progressBar: progress.Bar

  constructor(configuration: Configuration, emitter: EventEmitter) {
    this.configuration = configuration
    this.progressBar = new progress.Bar(
      {
        clearOnComplete: true,
        format: color.green(" {bar}") + " {percentage}% | ETA: {eta}s | {value}/{total}",
        hideCursor: undefined,
        stopOnComplete: true,
      },
      progress.Presets.shades_classic
    )
    emitter.on(CommandEvent.start, this.start.bind(this))
    emitter.on(CommandEvent.output, console.log)
    emitter.on(CommandEvent.success, this.success.bind(this))
    emitter.on(CommandEvent.failed, this.failed.bind(this))
    emitter.on(CommandEvent.warning, this.warning.bind(this))
    emitter.on(CommandEvent.skipped, this.skipped.bind(this))
  }

  start(args: StartArgs) {
    this.progressBar.start(args.stepCount, 0)
  }

  failed(args: FailedArgs) {
    this.progressBar.stop()
    console.log()
    console.log()
    console.log(color.dim(args.output))
    console.log(color.red(`${args.activity.file.platformified()}:${args.activity.line} -- ${args.error.message}\n`))
    console.log()
    printCodeFrame(
      console.log,
      path.join(this.configuration.sourceDir, args.activity.file.platformified()),
      args.activity.line
    )
  }

  skipped() {
    this.progressBar.increment(1)
  }

  success() {
    this.progressBar.increment(1)
  }

  warning() {
    this.progressBar.increment(1)
  }

  finish(args: FinishArgs) {
    printSummary(args.stats)
  }
}