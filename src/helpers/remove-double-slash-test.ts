import removeDoubleSlash from './remove-double-slash.js'
import { expect } from 'chai'

describe('removeDoubleSlash', function() {
  it('removes double slashes', function() {
    expect(removeDoubleSlash('/foo//bar/')).to.equal('/foo/bar/')
  })
})
