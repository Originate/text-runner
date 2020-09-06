import { assert } from "chai"
import { mergeConfigurations } from "./merge-configurations"
import { UserProvidedConfiguration } from "./types/user-provided-configuration"
import { Configuration, defaultConfiguration } from "./types/configuration"
import { Publications } from "./publications/publications"

suite("mergeConfigurations()", function () {
  test("no CLI args and config file data given", function () {
    const have = mergeConfigurations({}, {}, defaultConfiguration())
    assert.deepEqual(have, defaultConfiguration())
  })
  test("config file data given", function () {
    const configFileData: UserProvidedConfiguration = {
      exclude: "1.md",
      sourceDir: "my-source",
    }
    const have = mergeConfigurations({}, configFileData, defaultConfiguration())
    const want: Configuration = {
      defaultFile: "",
      exclude: "1.md",
      files: "**/*.md",
      formatterName: "detailed",
      online: false,
      publications: new Publications(),
      regionMarker: "type",
      sourceDir: "my-source",
      useSystemTempDirectory: false,
      workspace: "",
    }
    assert.deepEqual(have, want)
  })

  test("complex example", function () {
    const cmdlineArgs: UserProvidedConfiguration = {
      files: "1.md",
      online: false,
    }
    const configFileData: UserProvidedConfiguration = {
      formatterName: "dot",
      files: "**/*.md",
      online: true,
    }
    const defaultValues: UserProvidedConfiguration = {
      files: "*.md",
    }
    const result = mergeConfigurations(cmdlineArgs, configFileData, defaultValues)
    assert.deepEqual(result, {
      formatterName: "dot",
      files: "1.md",
      online: false,
    })
  })
})
