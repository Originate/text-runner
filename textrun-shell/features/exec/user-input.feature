Feature: running console commands

  Scenario: entering simple text into the console
    Given the workspace contains a file "echo.js" with content:
      """
      var fs = require("fs");
      var stdinBuffer = fs.readFileSync(0, "utf8");
      console.log("You entered:", stdinBuffer);
      """
    And the source code contains a file "enter-input.md" with content:
      """
      <a type="shell/command-with-input">

      Now execute this server by running `node echo.js`
      and enter:

      <table>
        <tr>
          <td>123</td>
        </tr>
      </table>

      </a>
      """
    When running text-run
    Then it signals:
      | FILENAME | enter-input.md                        |
      | LINE     | 1                                     |
      | MESSAGE  | running console command: node echo.js |
    And it prints:
      """
      You entered: 123
      """

  Scenario: entering complex text into the console
    Given the workspace contains a file "input.js" with content:
      """
      const readline = require("readline")
      var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      })

      rl.question("Name of the service to add\n", (service) => {
        rl.question("Description\n", (description) => {
          console.log(`service: ${service}, description: ${description}!`)
          rl.close()
          process.exit()
        })
      })
      """
    And the source code contains a file "enter-input.md" with content:
      """
      <a type="shell/command-with-input">

      Now execute this server by running `node input.js`
      and enter these values:

      <table>
        <tr>
          <th>When you see this</th>
          <th>then you enter</th>
        </tr>
        <tr>
          <td>Name of the service to add</td>
          <td>html-server</td>
        </tr>
        <tr>
          <td>Description</td>
          <td>serves the HTML UI</td>
        </tr>
      </table>

      </a>
      """
    When running text-run
    Then it signals:
      | FILENAME | enter-input.md                         |
      | LINE     | 1                                      |
      | MESSAGE  | running console command: node input.js |
    And it prints:
      """
      service: html-server, description: serves the HTML UI
      """
