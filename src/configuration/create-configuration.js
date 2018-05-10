// @flow

const fs = require('fs')

module.exports = function createConfiguration () {
  fs.writeFileSync(
    './text-run.yml',
    `# white-list for files to test
# This is a glob expression, see https://github.com/isaacs/node-glob#glob-primer
# The folder "node_modules" is already excluded.
# To exclude the "vendor" folder: '{,!(vendor)/**/}*.md'
files: '**/*.md'

# the formatter to use
format: detailed

# prefix that makes anchor tags active regions
classPrefix: 'textrun'

# whether to run the tests in an external temp directory,
# uses ./tmp if false,
# you can also provide a custom directory path here
useSystemTempDirectory: false

# whether to skip tests that require an online connection
offline: false

# activity-type specific configuration
activityTypes:
  runConsoleCommand:
    globals: {}`
  )
}
