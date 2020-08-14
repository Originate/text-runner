import * as assertNoDiff from "assert-no-diff"
import { removeTrailingColon } from "../src/helpers/remove-trailing-colon"
import { ActionArgs } from "text-runner"

export default function verifyHandlerArgs(action: ActionArgs) {
  const ignore = action.nodes[0].attributes.ignore
  const expectedTools = action.nodes.textInNodesOfType("strong").sort().map(removeTrailingColon)
  const actualTools = Object.keys(action)
    .sort()
    .filter((tool) => tool !== ignore)
  assertNoDiff.trimmedLines(expectedTools.join("\n"), actualTools.join("\n"))
}
