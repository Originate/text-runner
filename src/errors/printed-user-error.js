// @flow

const UserError = require('./user-error.js')

// Represents a UserError that has already been printed via the formatter.
// When receiving it, it should not be printed again.
module.exports = class PrintedUserError extends UserError {
}