// @flow

const loadTransformers = require('./load.js')
const { expect } = require('chai')

describe('loadTransformers', function () {
  it('loads MD files', async function () {
    const result = await loadTransformers('md')
    expect(Object.keys(result).length).to.be.above(0)
  })

  it('loads HTML files', async function () {
    const result = await loadTransformers('html')
    expect(Object.keys(result).length).to.be.above(0)
  })
})