import * as util from "util"
import * as activities from "../activities/index"
import { getFileNames } from "../filesystem/get-filenames"
import { findLinkTargets } from "../link-targets/find-link-targets"
import { parseMarkdownFiles } from "../parsers/markdown/parse-markdown-files"
import { AstNode } from "../parsers/standard-AST/ast-node"
import { AstNodeList } from "../parsers/standard-AST/ast-node-list"
import { UserError } from "../errors/user-error"
import { trimAllLineEnds } from "../helpers/trim-all-line-ends"
import { Command } from "./command"
import * as configuration from "../configuration/index"
import * as events from "../events/index"
import { EventEmitter } from "events"

export type DebugSubcommand = "activities" | "ast" | "images" | "links" | "linkTargets"

export class Debug implements Command {
  userConfig: configuration.PartialData
  subcommand: DebugSubcommand | undefined
  emitter: EventEmitter

  constructor(userConfig: configuration.PartialData, subcommand: DebugSubcommand | undefined) {
    this.userConfig = userConfig
    this.subcommand = subcommand
    this.emitter = new EventEmitter()
  }

  emit(name: events.CommandEvent, payload: events.Args): void {
    this.emitter.emit(name, payload)
  }

  async execute(): Promise<void> {
    const config = configuration.backfillDefaults(this.userConfig)
    const filenames = await getFileNames(config)
    if (filenames.length !== 1) {
      const guidance = `Please tell me which file to debug

Example: text-run debug --${this.subcommand} foo.md`
      throw new UserError("no files specified", guidance)
    }
    const guidance = `possible subcommands are:
--activities: active regions
--ast: AST nodes
--images: embedded images
--links: embedded links
--link-targets: document anchors to link to

Example: text-run debug --images foo.md`
    const ASTs = await parseMarkdownFiles(filenames, config.sourceDir)
    switch (this.subcommand) {
      case "activities":
        return debugActivities(ASTs, config)
      case "ast":
        return debugASTNodes(ASTs)
      case "images":
        return debugImages(ASTs)
      case "links":
        return debugLinks(ASTs)
      case "linkTargets":
        return debugLinkTargets(ASTs)
      case undefined:
        throw new UserError("missing debug sub-command", guidance)
      default:
        throw new UserError(`unknown debug sub-command: ${this.subcommand}`, guidance)
    }
  }

  on(name: events.CommandEvent, handler: events.Handler): this {
    this.emitter.on(name, handler)
    return this
  }
}

function debugActivities(ASTs: AstNodeList[], config: configuration.Data) {
  console.log("\nACTIVITIES:")
  const acts = activities.extractActivities(ASTs, config.regionMarker || "type")
  if (acts.length === 0) {
    console.log("(none)")
  } else {
    for (const act of acts) {
      console.log(`${act.file.platformified()}:${act.line}  ${act.actionName}`)
    }
  }
}

function debugASTNodes(ASTs: AstNodeList[]) {
  console.log("AST NODES:")
  for (const AST of ASTs) {
    for (const node of AST) {
      console.log(`${node.file.platformified()}:${node.line}  ${node.type} ${showAttr(node)}`)
    }
  }
}

function debugImages(ASTs: AstNodeList[]) {
  console.log("\nIMAGES:")
  const images = activities.extractImagesAndLinks(ASTs).filter(al => al.actionName === "check-image")
  if (images.length === 0) {
    console.log("(none)")
    return
  }
  for (const image of images) {
    image.document = new AstNodeList()
    console.log(trimAllLineEnds(util.inspect(image, false, Infinity)))
  }
}

function debugLinks(ASTs: AstNodeList[]) {
  console.log("\nLINKS:")
  const links = activities.extractImagesAndLinks(ASTs).filter(al => al.actionName === "check-link")
  if (links.length === 0) {
    console.log("(none)")
    return
  }
  for (const image of links) {
    image.document = new AstNodeList()
    console.log(trimAllLineEnds(util.inspect(image, false, Infinity)))
  }
}

function debugLinkTargets(ASTs: AstNodeList[]) {
  console.log("\nLINK TARGETS:")
  const linkTargets = findLinkTargets(ASTs)
  for (const key of Object.keys(linkTargets.targets)) {
    console.log(key, linkTargets.targets[key])
  }
}

function showAttr(node: AstNode): string {
  if (node.type === "text") {
    return `("${node.content.trim()}")`
  }
  const keys = Object.keys(node.attributes)
  if (keys.length === 0) {
    return ""
  }
  return `(${node.attributes.type})`
}
