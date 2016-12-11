require! {
  'chalk' : {bold, dim, green, magenta, red}
  'prelude-ls' : {compact, unique}
}


# A very robust formatter, prints output before the step name
class RobustFormatter

  ->

    # the path of the documentation file that is currently processed
    @documentation-file-path = ''

    # the line within the documentation file at which the currently processed block starts
    @documentation-file-line = -1

    @steps-count = 0
    @warnings-count = 0

    # Note: I have to define these attributes here,
    #       since doing so at the class level
    #       binds them to the class scope for some reason
    @stdout =
      write: @output

    @stderr =
      write: @output

    @console =
      log: (text) ~>
        @output "#{text}\n"


  output: (text) ~>
    console.log dim text.trim!


  refine: (@activity-text) ->


  set-lines: (@start-line, @end-line) ->


  # called when we start processing a markdown file
  start-file: (@documentation-file-path) ->


  # Called when we start performing an activity
  start: (@activity-text) ->
    @steps-count += 1


  # called when the last started activity finished successful
  # optionally allows to define the final text to be displayed
  success: (@activity-text = @activity-text)->
    @_print-activity-header green


  # Called on general errors
  error: (@error-message) ->
    @_print-activity-header bold . red
    process.exit 1


  # called when the whole test suite passed
  suite-success: (steps-count) ->
    text = green "\nSuccess! #{@steps-count} steps passed"
    if @warnings-count > 0
      text += green ", "
      text += magenta "#{@warnings-count} warnings"
    console.log bold text


  warning: (@warning-message) ->
    @warnings-count += 1
    @activity-text = ''
    @_print-activity-header bold . magenta


  _print-activity-header: (color) ->
    text = ''
    if @documentation-file-path
      text += @documentation-file-path
      if @start-line
        text += ":#{[@start-line, @end-line] |> compact |> unique |> (.join '-')}"
      text += ' -- '
    text += @activity-text if @activity-text
    text += @warning-message if @warning-message
    text += "\n#{@error-message}" if @error-message
    console.log color text



module.exports = RobustFormatter
