// @flow

const AstNode = require('../../../ast-node.js')
const AstNodeList = require('../../../ast-node-list.js')
const OpenTagTracker = require('../../helpers/open-tag-tracker.js')

module.exports = function transformATag (
  node: Object,
  openTags: OpenTagTracker,
  file: string,
  line: number
): AstNodeList {
  const result = new AstNodeList()
  const openingTag = openTags.popType('code_open', file, line)
  const resultNode = new AstNode({
    type: 'code_close',
    tag: '/code',
    file,
    line,
    content: '',
    attributes: openingTag.attributes
  })
  result.pushData(resultNode)
  return result
}