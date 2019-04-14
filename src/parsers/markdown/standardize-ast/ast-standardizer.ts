import { AbsoluteFilePath } from '../../../domain-model/absolute-file-path'
import { UnprintedUserError } from '../../../errors/unprinted-user-error'
import { AstNodeList } from '../../ast-node-list'
import { getHtmlBlockTag } from '../helpers/get-html-block-tag'
import { OpenTagTracker } from '../helpers/open-tag-tracker'
import { removeHtmlComments } from '../helpers/remove-html-comments'
import { loadTransformers } from '../standardize-ast/load-transformers'
import { CustomHtmlTagTransformer } from './custom-html-tags/custom-html-tag-transformer'
import { CustomMdTransformer } from './custom-md/custom-md-transformer'
import { GenericMdTransformer } from './generic-md/generic-md-transformer'
import { RemarkableNode } from './remarkable-node'
import { TransformerList } from './transformer-list'
import { GenericHtmlTagTransformer } from './generic-htmltag/generic-html-tag-transformer'
import { TagMapper } from './tag-mapper'

/**
 * AstStandardizer converts the AST created by Remarkable
 * into the standardized AST used by TextRunner
 */
export default class AstStandardizer {
  filepath: AbsoluteFilePath
  openTags: OpenTagTracker
  result: AstNodeList
  line: number
  genericMdTransformer: GenericMdTransformer
  customMdTransformer: CustomMdTransformer
  htmlBlockTransformers: TransformerList
  customHtmlTagTransformer: CustomHtmlTagTransformer
  genericHtmlTagTransformer: GenericHtmlTagTransformer
  tagMapper: TagMapper

  constructor(filepath: AbsoluteFilePath) {
    this.filepath = filepath
    this.openTags = new OpenTagTracker()
    this.tagMapper = new TagMapper()
    this.result = new AstNodeList()
    this.line = 1
    this.genericMdTransformer = new GenericMdTransformer(this.openTags)
    this.customMdTransformer = new CustomMdTransformer(this.openTags)
    this.htmlBlockTransformers = {}
    this.customHtmlTagTransformer = new CustomHtmlTagTransformer(this.openTags)
    this.genericHtmlTagTransformer = new GenericHtmlTagTransformer(
      this.openTags,
      this.tagMapper
    )
  }

  async loadTransformers() {
    await this.customMdTransformer.loadTransformers()
    this.htmlBlockTransformers = await loadTransformers('htmlblock')
    await this.customHtmlTagTransformer.loadTransformers()
  }

  async standardize(ast: any): Promise<AstNodeList> {
    for (const n of ast) {
      const node = n as RemarkableNode
      if (node.lines) {
        this.line = Math.max(node.lines[0] + 1, this.line)
      }

      if (node.children) {
        for (const child of node.children) {
          child.lines = node.lines
        }
        await this.standardize(node.children)
        continue
      }

      if (this.processSoftBreak(node)) {
        continue
      }
      if (await this.processHtmlBlock(node)) {
        continue
      }
      if (
        this.customHtmlTagTransformer.canTransform(
          node,
          this.filepath,
          this.line
        )
      ) {
        this.processCustomHtmlTag(node)
        continue
      }
      if (this.genericHtmlTagTransformer.canTransform(node)) {
        this.processGenericHtmlTag(node)
        continue
      }
      if (this.customMdTransformer.canTransform(node)) {
        this.processCustomMdNode(node)
        continue
      }
      if (this.genericMdTransformer.canTransform(node)) {
        this.processGenericMdNode(node)
        continue
      }
      throw new Error(`Unprocessable node: ${node.type}`)
    }
    return this.result
  }

  processGenericHtmlTag(node: RemarkableNode) {
    const transformed = this.genericHtmlTagTransformer.transform(
      node,
      this.filepath,
      this.line
    )
    for (const transformedNode of transformed) {
      this.result.push(transformedNode)
    }
  }

  async processHtmlBlock(node: RemarkableNode): Promise<boolean> {
    if (node.type !== 'htmlblock') {
      return false
    }
    const tagName = getHtmlBlockTag(
      removeHtmlComments(node.content),
      this.filepath,
      this.line
    )
    const transformer = this.htmlBlockTransformers[tagName]
    if (!transformer) {
      throw new UnprintedUserError(
        `Unknown HTML block: '${tagName}'`,
        this.filepath.platformified(),
        this.line
      )
    }
    const transformed = await transformer(
      node,
      this.openTags,
      this.filepath,
      this.line
    )
    for (const transformedNode of transformed) {
      this.result.push(transformedNode)
    }
    return true
  }

  processCustomHtmlTag(node: RemarkableNode) {
    const transformed = this.customHtmlTagTransformer.transform(
      node,
      this.filepath,
      this.line
    )
    for (const transformedNode of transformed) {
      this.result.push(transformedNode)
    }
  }

  processGenericMdNode(node: RemarkableNode): boolean {
    const transformed = this.genericMdTransformer.transform(
      node,
      this.filepath,
      this.line
    )
    for (const transformedNode of transformed) {
      this.result.push(transformedNode)
    }
    return true
  }

  processCustomMdNode(node: any): boolean {
    const transformed = this.customMdTransformer.transform(
      node,
      this.filepath,
      this.line
    )
    for (const transformedNode of transformed) {
      this.result.push(transformedNode)
    }
    return true
  }

  processSoftBreak(node: RemarkableNode): boolean {
    if (node.type !== 'softbreak') {
      return false
    }
    this.line += 1
    return true
  }
}
