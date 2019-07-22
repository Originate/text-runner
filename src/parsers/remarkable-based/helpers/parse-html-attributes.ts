const tupleRE = /([^=]+="[^"]*")/g

export function parseHtmlAttributes(
  attributes: string
): { [key: string]: string } {
  const attrMatch = attributes.match(tupleRE)
  if (!attrMatch) {
    return {}
  }
  return attrMatch.map(attr => attr.split("=", 2)).reduce(reducer, {}) || {}
}

function reducer(acc: { [key: string]: string }, attr: string[]): {} {
  const [key, value] = attr
  acc[key.trim()] = value.trim().replace(/"/g, "")
  return acc
}