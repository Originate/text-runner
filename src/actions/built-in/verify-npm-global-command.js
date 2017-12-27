// @flow

const {cyan, green, red} = require('chalk')
const path = require('path')
const {any} = require('prelude-ls')
const trimDollar = require('../../helpers/trim-dollar')

module.exports = function (args: {configuration: Configuration, formatter: Formatter, searcher: Searcher}, done: DoneFunction) {
  args.formatter.start('verifying exported global command')

  const commandName = trimDollar(args.searcher.nodeContent({types: ['fence', 'code']}, ({nodes}) => {
    if (nodes.length === 0) return 'missing code block'
    if (nodes.length > 1) return 'found multiple code blocks'
  })).trim()

  const pkg = require(path.join(process.cwd(), 'package.json'))
  args.formatter.refine(`looking for an exported ${cyan(commandName)} command`)

  if (!hasCommandName(commandName, pkg.bin)) {
    args.formatter.error(`${cyan('package.json')} does not export a ${red(commandName)} command`)
    return done(new Error('1'))
  }
  args.formatter.success(`provides a global ${green(commandName)} command`)
  done()
}

function hasCommandName (commandName: string, exportedCommands: { [string]: string}): boolean {
  return Object.keys(exportedCommands)
               .some((command) => command === commandName)
}