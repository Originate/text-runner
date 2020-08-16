import * as color from "colorette"
import * as glob from "glob"
import * as interpret from "interpret"
import * as path from "path"
import * as rechoir from "rechoir"
import { Activity } from "../activity-list/types/activity"
import { UnprintedUserError } from "../errors/unprinted-user-error"
import { actionName } from "./helpers/action-name"
import { javascriptExtensions } from "./helpers/javascript-extensions"
import { trimExtension } from "./helpers/trim-extension"
import { Action } from "./types/action"
import { ExternalActionManager } from "./external-action-manager"
import { Actions } from "./actions"

export interface FunctionRepo {
  [key: string]: Action
}

/** ActionFinder provides runnable action instances for activities. */
export class ActionFinder {
  private readonly builtinActions: Actions
  private readonly customActions: Actions
  private readonly externalActions: ExternalActionManager

  constructor(sourceDir: string) {
    this.builtinActions = this.loadBuiltinActions()
    this.customActions = loadCustomActions(path.join(sourceDir, "text-run"))
    this.externalActions = new ExternalActionManager()
  }

  /** actionFor provides the action function for the given Activity. */
  actionFor(activity: Activity): Action {
    return (
      this.builtinActions.get(activity.actionName) ||
      this.customActions.get(activity.actionName) ||
      this.externalActions.get(activity.actionName) ||
      this.errorUnknownAction(activity)
    )
  }

  /** customActionNames returns the names of all built-in actions. */
  customActionNames(): string[] {
    return this.customActions.names()
  }

  /** errorUnknownAction signals that the given activity has no known action. */
  private errorUnknownAction(activity: Activity): never {
    let errorText = `unknown action: ${color.red(activity.actionName)}\nAvailable built-in actions:\n`
    for (const actionName of this.builtinActions.names()) {
      errorText += `* ${actionName}\n`
    }
    if (this.customActions.size() > 0) {
      errorText += "\nUser-defined actions:\n"
      for (const actionName of this.customActions.names()) {
        errorText += `* ${actionName}\n`
      }
    } else {
      errorText += "\nNo custom actions defined.\n"
    }
    errorText += `\nTo create a new "${activity.actionName}" action,\n`
    errorText += `run "text-run scaffold ${activity.actionName}"\n`
    throw new UnprintedUserError(errorText, activity.file.platformified(), activity.line)
  }

  private loadBuiltinActions(): Actions {
    const result = new Actions()
    for (const filename of this.builtinActionFilePaths()) {
      result.register(actionName(filename), require(filename))
    }
    return result
  }

  private builtinActionFilePaths(): string[] {
    return glob
      .sync(path.join(__dirname, "..", "actions", "built-in", "*.?s"))
      .filter((name) => !name.endsWith(".d.ts"))
      .map(trimExtension)
  }
}

export function customActionFilePaths(dir: string): string[] {
  const pattern = path.join(dir, `*.@(${javascriptExtensions().join("|")})`)
  return glob.sync(pattern)
}

export function loadCustomActions(dir: string): Actions {
  const result = new Actions()
  for (const filename of customActionFilePaths(dir)) {
    rechoir.prepare(interpret.jsVariants, filename)
    const standardName = actionName(filename)
    const action = require(filename)
    result.register(standardName, action)
  }
  return result
}
