// @flow

import type { AstNode } from '../2-read-and-parse/ast-node.js'
import type { AstNodeList } from '../2-read-and-parse/ast-node-list.js'

const Searcher = require('./searcher.js')
const { expect } = require('chai')

describe('Searcher', function () {
  beforeEach(function () {
    const nodes: AstNodeList = [
      makeNode({ type: 'image', content: 'image content' }),
      makeNode({ type: 'link', content: 'link content' })
    ]
    this.searcher = new Searcher(nodes)
  })

  context('string query', function () {
    beforeEach(function () {
      this.result = this.searcher.tagContent('link')
    })

    it('returns the content of the matching node', function () {
      expect(this.result).to.equal('link content')
    })
  })

  context('array query', function () {
    beforeEach(function () {
      this.result = this.searcher.tagContent(['heading', 'link'])
    })

    it('returns the content of the matching node', function () {
      expect(this.result).to.equal('link content')
    })
  })
})

function makeNode (attrs): AstNode {
  return {
    type: attrs.type || '',
    content: attrs.content || '',
    filepath: '',
    line: -1,
    html: '',
    attributes: {}
  }
}