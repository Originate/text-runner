import { assert } from "chai"

import * as ast from "../ast"
import * as files from "../filesystem/index"
import * as linkTarget from "./index"

suite("linkTarget.List.addNodeList()", function () {
  test("node list with anchors", function () {
    const nodeList = ast.NodeList.scaffold({
      attributes: { name: "foo bar" },
      file: "file.md",
      type: "anchor_open",
    })
    const targetList = new linkTarget.List()
    targetList.addNodeList(nodeList)
    const location = new files.Location(new files.SourceDir(""), new files.FullFile("file.md"), 1)
    assert.isTrue(targetList.hasAnchor(location, "foo-bar"))
  })

  test("node list without link targets", function () {
    const nodeList = ast.NodeList.scaffold({ file: "file.md", type: "text" })
    const targetList = new linkTarget.List()
    targetList.addNodeList(nodeList)
    assert.isTrue(targetList.hasFile(new files.FullFile("file.md")), "should register files without link targets")
  })

  test("node list with headings", function () {
    const nodeList = new ast.NodeList()
    nodeList.pushNode({
      attributes: {},
      file: "file.md",
      type: "h1_open",
    })
    nodeList.pushNode({
      content: "Get Started in 5 Minutes",
      file: "file.md",
      type: "text",
    })
    nodeList.pushNode({
      file: "file.md",
      type: "h1_close",
    })
    const targetList = new linkTarget.List()
    targetList.addNodeList(nodeList)
    const location = new files.Location(new files.SourceDir(""), new files.FullFile("file.md"), 1)
    assert.isTrue(targetList.hasAnchor(location, "get-started-in-5-minutes"))
  })
})

suite("linkTarget.List.anchorType()", function () {
  test("headings", function () {
    const nodeList = new ast.NodeList()
    nodeList.pushNode({
      attributes: {},
      file: "file.md",
      type: "heading_open",
    })
    nodeList.pushNode({
      content: "foo bar",
      file: "file.md",
      type: "text",
    })
    nodeList.pushNode({
      file: "file.md",
      type: "heading_close",
    })
    const list = new linkTarget.List()
    list.addHeading(nodeList[0], nodeList)
    const filePath = new files.FullFile("file.md")
    const location = new files.Location(new files.SourceDir(""), filePath, 1)
    assert.equal(list.anchorType(location, "foo-bar"), "heading")
  })

  test("anchors", function () {
    const list = new linkTarget.List()
    const filePath = new files.FullFile("foo.md")
    const location = new files.Location(new files.SourceDir(""), filePath, 1)
    list.addLinkTarget(location, "anchor", "hello")
    assert.equal(list.anchorType(location, "hello"), "anchor")
  })
})

test("linkTarget.List.hasAnchor()", function () {
  const list = new linkTarget.List()
  const filePath = new files.FullFile("foo.md")
  const location = new files.Location(new files.SourceDir(""), filePath, 1)
  list.addLinkTarget(location, "heading", "hello")
  assert.isTrue(list.hasAnchor(location, "hello"))
  assert.isFalse(list.hasAnchor(location, "zonk"))
})

suite("linkTarget.List.hasFile()", function () {
  test("contains file with anchors", function () {
    const list = new linkTarget.List()
    const filePath = new files.FullFile("foo.md")
    const location = new files.Location(new files.SourceDir(""), filePath, 1)
    list.addLinkTarget(location, "heading", "hello")
    assert.isTrue(list.hasFile(filePath))
  })

  test("contains the file without anchors", function () {
    const nodeList = ast.NodeList.scaffold({ file: "file.md", type: "text" })
    const targetList = new linkTarget.List()
    targetList.addNodeList(nodeList)
    assert.isTrue(targetList.hasFile(new files.FullFile("file.md")))
  })

  test("doesn't contain the file", function () {
    const list = new linkTarget.List()
    const filePath = new files.FullFile("foo.md")
    assert.isFalse(list.hasFile(filePath))
  })
})
