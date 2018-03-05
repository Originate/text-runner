// @flow

import type { Command } from '../command.js'
import type Configuration from '../../configuration/configuration.js'
import type Formatter from '../../formatters/formatter.js'
import type { LinkTargetList } from './link-target-list.js'

const ActivityTypeManager = require('./activity-type-manager.js')
const { red } = require('chalk')
const fs = require('fs')
const glob = require('glob')
const isGlob = require('is-glob')
const MarkdownFileRunner = require('./markdown-file-runner')
const mkdirp = require('mkdirp')
const path = require('path')
const tmp = require('tmp')
const debug = require('debug')('text-runner:run-command')
const UnprintedUserError = require('../../errors/unprinted-user-error.js')

class RunCommand implements Command {
  configuration: Configuration
  formatter: Formatter
  activityTypesManager: ActivityTypeManager
  linkTargets: LinkTargetList // lists which files contain which HTML anchors
  runners: MarkdownFileRunner[]

  constructor (value: {
    configuration: Configuration,
    formatter: Formatter,
    activityTypesManager: ActivityTypeManager
  }) {
    this.configuration = value.configuration
    this.formatter = value.formatter
    this.activityTypesManager = value.activityTypesManager
    this.linkTargets = {}
  }

  // Tests all files
  async run (filename: string) {
    if (hasDirectory(filename)) {
      await this.runDirectory(filename)
    } else if (isMarkdownFile(filename)) {
      await this.runFile(filename)
    } else if (isGlob(filename)) {
      await this.runGlob(filename)
    } else if (filename) {
      throw new UnprintedUserError(`file or directory does not exist: ${red(filename)}`)
    } else {
      await this.runAll()
    }
  }

  async runAll () {
    await this._run(this._allMarkdownFiles())
  }

  // Tests all files in the given directory
  async runDirectory (dirname: string) {
    await this._run(this._markdownFilesInDir(dirname))
  }

  // Tests the given file
  async runFile (filename: string) {
    await this._run([filename])
  }

  // Tests the files described by the given glob expression
  async runGlob (fileExpression: string) {
    const files = this._filesMatchingGlob(fileExpression)
    if (files != null) {
      await this._run(files)
    }
  }

  // Runs the currently set up runners.
  async _run (filenames: string[]) {
    filenames = this._removeExcludedFiles(filenames)
    debug('testing files:')
    for (let filename of filenames) {
      debug(`  * ${filename}`)
    }
    this._createWorkingDir()
    this._createRunners(filenames)
    await this._prepareRunners()
    await this._executeRunners()
  }

  _createRunners (filenames: string[]) {
    this.runners = []
    for (let filePath of filenames) {
      const runner = new MarkdownFileRunner({
        filePath,
        formatter: this.formatter,
        activityTypesManager: this.activityTypesManager,
        configuration: this.configuration,
        linkTargets: this.linkTargets
      })
      this.runners.push(runner)
    }
  }

  // Creates the temp directory to run the tests in
  _createWorkingDir () {
    const setting = this.configuration.get('useSystemTempDirectory')
    if (typeof setting === 'string') {
      this.configuration.testDir = setting
    } else if (setting === false) {
      this.configuration.testDir = path.join(process.cwd(), 'tmp')
    } else if (setting === true) {
      this.configuration.testDir = tmp.dirSync().name
    } else {
      throw new UnprintedUserError(`unknown 'useSystemTempDirectory' setting: ${setting}`)
    }
    debug(`using test directory: ${this.configuration.testDir}`)
    mkdirp.sync(this.configuration.testDir)
  }

  _filesMatchingGlob (expression: string): string[] {
    return glob.sync(expression).sort()
  }

  _removeExcludedFiles (files: string[]): string[] {
    var excludedFiles = this.configuration.get('exclude')
    if (!excludedFiles) return files
    var excludedFilesArray = []
    if (Array.isArray(excludedFiles)) {
      excludedFilesArray = excludedFiles
    } else {
      excludedFilesArray = [excludedFiles]
    }
    return files.filter(file => {
      for (let excludedFile of excludedFilesArray) {
        const regex = new RegExp(excludedFile)
        return !regex.test(file)
      }
    })
  }

  // Returns all the markdown files in this directory and its children
  _markdownFilesInDir (dirName) {
    const files = glob.sync(`${dirName}/**/*.md`)
    if (files.length === 0) {
      this.formatter.warning('no Markdown files found')
    }
    return files.filter(file => !file.includes('node_modules')).sort()
  }

  // Returns all the markdown files in the current working directory
  _allMarkdownFiles () {
    var files = glob.sync(this.configuration.get('files'))
    if (files.length === 0) {
      this.formatter.warning('no Markdown files found')
    }
    files = files.filter(file => !file.includes('node_modules')).sort()
    // if (this.filename != null) {
    //   files = files.filter(file => !file === this.filename)
    // }
    return files
  }

  async _executeRunners (): Promise<void> {
    for (let runner of this.runners) {
      await runner.run()
    }
    this.formatter.suiteSuccess()
  }

  async _prepareRunners () {
    for (let runner of this.runners) {
      await runner.prepare()
    }
  }
}

// TODO: extract into helper dir
function hasDirectory (dirname: string): boolean {
  try {
    return fs.statSync(dirname).isDirectory()
  } catch (e) {
    return false
  }
}

function isMarkdownFile (filename: string): boolean {
  try {
    const filepath = path.join(process.cwd(), filename)
    return filename.endsWith('.md') && fs.statSync(filepath).isFile()
  } catch (e) {
    return false
  }
}

module.exports = RunCommand
