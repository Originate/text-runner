// @flow

const AstNode = require('../../../ast-node.js')
const AstNodeList = require('../../../ast-node-list.js')
const parseHtmlAttributes = require('../../helpers/parse-html-attributes.js')
const OpenTagTracker = require('../../helpers/open-tag-tracker.js')
const UnprintedUserError = require('../../../../errors/unprinted-user-error.js')

const preRegex = /<pre([^>]*)>([\s\S]*)<\/pre>/m

module.exports = async function transformPre (
  node: Object,
  openTags: OpenTagTracker,
  file: string,
  line: number
): Promise<AstNodeList> {
  const result = new AstNodeList()
  const match = node.content.match(preRegex)
  if (!match) throw new UnprintedUserError('cannot match <pre> tag', file, line)
  const resultNode = new AstNode({
    type: 'fence',
    tag: 'pre',
    file,
    line,
    content: match[2],
    attributes: parseHtmlAttributes(match[1])
  })
  result.pushData(resultNode)
  return result
}
