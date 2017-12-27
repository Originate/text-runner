// @flow

const {cyan} = require('chalk')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const {capitalize, filter, map} = require('prelude-ls')
const debug = require('debug')('textrun:actions:create-file')

module.exports = function (params: {configuration: Configuration, formatter: Formatter, searcher: Searcher}, done: DoneFunction) {
  params.formatter.start('creating file')

  const filePath = params.searcher.nodeContent({types: ['emphasizedtext', 'strongtext']}, ({nodes, content}) => {
    if (nodes.length === 0) return 'no path given for file to create'
    if (nodes.length > 1) return `several file paths found: ${nodes.map((node) => node.content).map((word) => cyan(word)).join(' and ')}`
    if (!content) return 'no path given for file to create'
  })

  const content = params.searcher.nodeContent({types: ['fence', 'code']}, ({nodes, content}) => {
    if (nodes.length === 0) return 'no content given for file to create'
    if (nodes.length > 1) return 'found multiple content blocks for file to create, please provide only one'
    if (!content) return 'no content given for file to create'
  })

  params.formatter.refine(`creating file ${cyan(filePath)}`)
  const fullPath = path.join(params.configuration.testDir, filePath)
  debug(fullPath)
  mkdirp(path.dirname(fullPath), (err) => {
    if (err) {
      done(err)
      return
    }
    fs.writeFile(fullPath, content, (err) => {
      if (err) {
        params.formatter.error(err)
        done(new Error('1'))
      } else {
        params.formatter.success()
        done()
      }
    })
  })
}