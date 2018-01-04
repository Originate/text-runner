// @flow

const {bold, cyan} = require('chalk')
const fs = require('fs')
const path = require('path')

// Verifies that the test workspace contains the given directory
module.exports = function (activity: Activity) {
  const directory = activity.searcher.nodeContent({type: 'code'}, ({content, nodes}) => {
    if (nodes.length === 0) return 'no code block found'
    if (nodes.length > 1) return 'too many code blocks found'
    if (content.trim().length === 0) return 'empty code block found'
  })

  const fullPath = path.join(activity.configuration.testDir, directory)
  activity.formatter.action(`verifying the ${bold(cyan(directory))} directory exists in the test workspace`)
  var stats
  try {
    stats = fs.lstatSync(fullPath)
  } catch (err) {
    throw new Error(`directory ${cyan(bold(directory))} does not exist in the test workspace`)
  }
  if (!stats.isDirectory()) {
    throw new Error(`${cyan(bold(directory))} exists but is not a directory`)
  }
}
