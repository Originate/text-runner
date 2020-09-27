import { After, Before } from "cucumber"
import { endChildProcesses } from "end-child-processes"
import { promises as fs } from "fs"
import * as path from "path"
import * as rimraf from "rimraf"
import * as tmp from "tmp-promise"
import * as util from "util"
const rimrafp = util.promisify(rimraf)

// eslint-disable-next-line @typescript-eslint/no-misused-promises
Before(async function () {
  if (process.env.CUCUMBER_PARALLEL) {
    const tempDir = await tmp.dir()
    this.rootDir = tempDir.path
  } else {
    this.rootDir = path.join(process.cwd(), "tmp")
  }
  let rootDirExists = false
  try {
    await fs.stat(this.rootDir)
    rootDirExists = true
  } catch (e) {
    // nothing to do here
  }
  if (rootDirExists) {
    await fs.rmdir(this.rootDir, { recursive: true })
  }
  await fs.mkdir(this.rootDir, { recursive: true })
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
After({ timeout: 20_000 }, async function (scenario) {
  await endChildProcesses()
  if (scenario.result.status === "failed") {
    console.log("\ntest artifacts are located in", this.rootDir)
  } else {
    // NOTE: need rimraf here because Windows requires to retry this for a few times
    // TODO: replace with fs
    await rimrafp(this.rootDir)
  }
})

Before({ tags: "@verbose" }, function () {
  this.verbose = true
})

After({ tags: "@verbose" }, function () {
  this.verbose = false
})

Before({ tags: "@debug" }, function () {
  this.debug = true
  this.verbose = true
})

After({ tags: "@debug" }, function () {
  this.debug = false
  this.verbose = false
})
