import { WorkspaceTagger } from "./workspace-tagger"
import { strict as assert } from "assert"

suite("WorkspaceTagger", function () {
  test("tagging workspace folders", function () {
    const wst = new WorkspaceTagger(["one", "two", "three"])
    wst.tagMany(["three", "one"])
    assert.deepEqual(wst.tagged(), ["one", "three"])
  })
  test("tagging non-workspace folders", function () {
    const wst = new WorkspaceTagger(["one", "two"])
    wst.tagMany(["two", "zonk"])
    assert.deepEqual(wst.tagged(), ["two", "."])
  })
  test("getWorkspace", function () {
    const wst = new WorkspaceTagger(["examples/one", "examples/two", "tools/three"])
    assert.equal(wst.getWorkspace("examples/two/README.md"), "examples/two")
  })
})