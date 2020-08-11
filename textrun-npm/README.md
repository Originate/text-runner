# Text-Runner Actions for npm

This package provides [Text-Runner](https://github.com/kevgo/text-runner)
actions for verifying the documentation of npm packages.

### Installation

To use these actions, add this package as a development dependency by running

<pre textrun="npm/install">
$ npm i -D textrun-npm
</pre>

or

<pre textrun="npm/install">
$ yarn i -D textrun-npm
</pre>

## Verify installation instructions

The <b textrun="action/name-full">npm/install</b> action verifies that the
documentation of an npm package correctly describes that this package should be
installed as a development dependency. As an example, let's assume we are
testing the documentation of an npm package called `foobar`.
<a textrun="create-file">Its **package.json** file would contain amongst other
things:

```json
{
  "name": "foobar"
}
```

</a>

<a textrun="create-file">

In the documentation of this npm package, for example its **README.md** file, we
want to document how to install this package. It would contain a section that
looks something like this:

```md
Install the foobar package by running:

<pre textrun="npm/install">
$ npm install foobar
</pre>

or with Yarn:

<pre textrun="npm/install">
$ yarn add foobar
</pre>
```

</a>

<a textrun="run-textrunner">

Text-Runner verifies that the installation instructions contain the correct name
of the npm package.

</a>

## Verify exported binaries

The <b textrun="action/name-full">npm/executable</b> action verifies
documentation of exported binaries of npm packages. Let's say the source code of
our `foobar` package contains an executable file
<b textrun="binary-name">bin/foo</b>, which is listed as a binary in its
<a textrun="create-file">**package.json** file:

```js
{
  "name": "foobar",
  "bin": {
    "foo": "bin/foo"
  }
}
```

</a>

<a textrun="append-file">

The **README.md** file for the "foobar" package would document this binary
something like this:

```md
After you install the "foobar" package, you can run the
<code textrun="npm/executable">foo</code> command in the terminal.
```

<a textrun="run-textrunner">
</a>