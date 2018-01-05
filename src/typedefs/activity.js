// @flow

// Activity is an action instance, i.e. a particular activity that we are going to do
// on a particular place in a particular document, defined by an action
type Activity = {
  filename: string,
  startLine: ?number,
  endLine?: number,
  formatter: Formatter,
  runner: Action,
  nodes: AstNodeList,
  linkTargets: LinkTargetList,
  configuration: Configuration,
  searcher: Searcher
}
