import { AbsoluteFilePath } from "../../../../../finding-files/absolute-file-path"
import { AstNode } from "../../../../standard-AST/ast-node"
import { AstNodeList } from "../../../../standard-AST/ast-node-list"
import { OpenTagTracker } from "../../../helpers/open-tag-tracker"
import { parseHtmlAttributes } from "../../../helpers/parse-html-attributes"
import { RemarkableNode } from "../../remarkable-node"

const blockquoteRegex = /<blockquote([^>]*)>([\s\S]*)<\/blockquote>/m

export default function(
  node: RemarkableNode,
  openTags: OpenTagTracker,
  file: AbsoluteFilePath,
  line: number
): AstNodeList {
  const result = new AstNodeList()
  let attributes = {}
  if (node.content) {
    const match = node.content.match(blockquoteRegex)
    if (!match) {
      throw new Error(`cannot parse blockquote content: ${node.content}`)
    }
    attributes = parseHtmlAttributes(match[1])
  }
  const resultNode = new AstNode({
    attributes,
    content: "",
    file,
    line,
    tag: "blockquote",
    type: node.type
  })
  openTags.add(resultNode)
  result.pushNode(resultNode)
  return result
}