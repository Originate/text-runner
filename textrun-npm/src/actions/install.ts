import color from "colorette"
import fs from "fs-extra"
import path from "path"
import { trimDollar } from "../helpers/trim-dollar"
import { ActionArgs } from "text-runner"

export async function install(args: ActionArgs) {
  const installText = trimDollar(args.nodes.textInNodeOfType("fence", "code"))
  args.name(`check NPM package name ${color.cyan(installText)}`)

  const dir = args.nodes[0]?.attributes?.dir || ""
  const pkg = await fs.readJSON(path.join(args.configuration.sourceDir, dir, "package.json"))

  if (missesPackageName(installText, pkg.name)) {
    throw new Error(
      `installation instructions ${color.cyan(installText)} don't contain expected npm package name ${color.cyan(
        pkg.name
      )}`
    )
  }
}

function missesPackageName(installText: string, packageName: string): boolean {
  // Note: cannot use minimist here
  //       because it is too stupid to understand
  //       that NPM uses '-g' by itself, and not as a switch for the argument after it
  return (
    installText
      .split(" ")
      .map((word) => word.trim())
      .filter((word) => word === packageName).length === 0
  )
}
