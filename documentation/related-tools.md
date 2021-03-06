# Related Tools

There are many other good testing tools out there. They can be combined with
TextRunner or could be viable alternatives to it, depending on your use case:

- [Cucumber](https://cucumber.io): Runs tests via automated user stories,
  acceptance criteria, and example scenarios. TextRunner and Cucumber complement
  each other. You would use TextRunner for the end-user facing documentation and
  Cucumber for day-to-day BDD, including all the edge cases and failure
  scenarios that you don't necessarily want to document for end users.

- [Gauge](http://getgauge.io): a "Cucumber for Markdown". Imposes a pretty
  strict format on the Markdown. With TextRunner there are no restrictions on
  how the Markdown has to look like; it can be 100% human-friendly prose.

- [doctest](https://docs.python.org/3/library/doctest.html): executes only
  actual code blocks in your documentation, and verifies only that it runs
  without errors. TextRunner is a superset of this tool, it can run anything
  that can be described textually, and verify it in arbitrary ways.

- [rust-skeptic](https://github.com/brson/rust-skeptic): executes Rust code
  embedded in Markdown. Text-Runner is a superset of rust-skeptic.

- [mockdown](https://github.com/pjeby/mockdown): like doctest, with verification
  of the output.
