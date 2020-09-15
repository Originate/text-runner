import { ActivityList } from "../activity-list/types/activity-list"
import { Configuration } from "../configuration/configuration"
import { Formatter } from "../formatters/formatter"
import { LinkTargetList } from "../link-targets/link-target-list"
import { StatsCounter } from "./helpers/stats-counter"
import { runActivity } from "./run-activity"
import { ActionFinder } from "../actions/action-finder"
import { ExecuteResult } from "./execute-result"

export async function executeSequential(
  activities: ActivityList,
  actionFinder: ActionFinder,
  configuration: Configuration,
  linkTargets: LinkTargetList,
  statsCounter: StatsCounter,
  formatter: Formatter
): Promise<ExecuteResult> {
  let result = ExecuteResult.empty()
  for (const activity of activities) {
    const actRes = await runActivity(activity, actionFinder, configuration, linkTargets, statsCounter, formatter)
    result = result.merge(actRes)
    if (actRes.errorCount > 0) {
      break
    }
  }
  return result
}
