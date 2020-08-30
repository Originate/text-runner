import * as color from "colorette"
import { debugCommand } from "./commands/debug"
import { dynamicCommand } from "./commands/dynamic"
import { helpCommand } from "./commands/help"
import { runCommand } from "./commands/run"
import { scaffoldCommand } from "./commands/scaffold"
import { setupCommand } from "./commands/setup"
import { staticCommand } from "./commands/static"
import { unusedCommand } from "./commands/unused"
import { versionCommand } from "./commands/version"
import { UserProvidedConfiguration } from "./configuration/types/user-provided-configuration"
import { ActivityResult } from "./activity-list/types/activity-result"
import { ExecuteResult } from "./runners/execute-result"

export type Commands = "debug" | "dynamic" | "help" | "run" | "scaffold" | "setup" | "static" | "unused" | "version"

/**
 * Tests the documentation in the given directory
 * @param cmdLineArgs the arguments provided on the command line
 * @returns the number of documentation errors encountered
 * @throws developer errors
 */
export async function textRunner(cmdlineArgs: UserProvidedConfiguration): Promise<ExecuteResult> {
  const originalDir = process.cwd()
  try {
    switch (cmdlineArgs.command) {
      case "help":
        await helpCommand()
        return ExecuteResult.empty()
      case "scaffold":
        await scaffoldCommand(cmdlineArgs.fileGlob)
        return ExecuteResult.empty()
      case "setup":
        await setupCommand()
        return ExecuteResult.empty()
      case "version":
        await versionCommand()
        return ExecuteResult.empty()
      case "debug":
        return await debugCommand(cmdlineArgs)
      case "dynamic":
        return await dynamicCommand(cmdlineArgs)
      case "run":
        return await runCommand(cmdlineArgs)
      case "static":
        return await staticCommand(cmdlineArgs)
      case "unused":
        return await unusedCommand(cmdlineArgs)
      default:
        console.log(color.red(`unknown command: ${cmdlineArgs.command || ""}`))
        return new ExecuteResult([], 1)
    }
  } catch (err) {
    process.chdir(originalDir)
    throw err
  }
}

export type { ActionArgs } from "./actions/types/action-args"
export type { Configuration } from "./configuration/types/configuration"
export { AstNode } from "./parsers/standard-AST/ast-node"
export { AstNodeList } from "./parsers/standard-AST/ast-node-list"
export { actionName } from "./actions/helpers/action-name"
export { ActivityResult }
export { ExecuteResult }
