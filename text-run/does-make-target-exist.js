// @flow

import type { ActionArgs } from '../src/commands/run/5-execute/action-args.js'

const util = require('util')
const exec = util.promisify(require('child_process').exec)

module.exports = async function (args: ActionArgs) {
  const makeExpression = args.nodes.textInNodeOfType('code')
  const expected = makeExpression.split(' ')[1]
  const { stdout, stderr } = await exec(
    "cat Makefile | grep '^[^ ]*:' | grep -v '.PHONY' | grep -v help | sed 's/:.*#//'"
  )
  if (stderr.length > 0) {
    throw new Error(`Error running 'make help': ${stderr}`)
  }
  const actuals = stdout.split('\n').map(actual => actual.split(' ')[0])
  if (!actuals.includes(expected)) {
    throw new Error(`binary '${expected}' does not exist`)
  }
}
