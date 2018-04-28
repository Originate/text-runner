// @flow

import type { AstNode } from '../../../ast-node.js'

const OpenTagTracker = require('../../helpers/open-tag-tracker.js')

module.exports = function (
  node: Object,
  openTags: OpenTagTracker,
  file: string,
  line: number
): Array<AstNode> {
  return [
    {
      type: 'code_open',
      tag: 'code',
      file: file,
      line,
      content: '',
      attributes: {}
    },
    {
      type: 'text',
      tag: '',
      file: file,
      line,
      content: node.content,
      attributes: {}
    },
    {
      type: 'code_close',
      tag: '/code',
      file: file,
      line,
      content: '',
      attributes: {}
    }
  ]
}