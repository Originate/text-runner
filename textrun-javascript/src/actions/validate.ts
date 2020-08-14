import { ActionArgs } from "text-runner"

/** checks the given JavaScript code for syntax errors. */
export function validate(action: ActionArgs) {
  const code = action.nodes.text().trim()
  if (code.length === 0) {
    throw new Error("no JavaScript code found")
  }
  try {
    new Function(code)
  } catch (e) {
    throw new Error(`invalid Javascript: ${e.message}`)
  }
}
