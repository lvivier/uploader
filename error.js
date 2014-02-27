
/**
 * TODO component
 * TODO handle string or dom
 * parse S3 errors
 */
module.exports = error
exports.S3Error = S3Error

function error (str) {
  var node = xml(str).firstChild.childNodes[0]
  var obj = {}

  while (node.nextSibling) {
    obj[toCamel(node.nodeName)] = node.textContent
    node = node.nextSibling
  }

  return new S3Error(obj)
}

/**
 * Parse a string of XML
 * TODO IE compat
 * TODO return false instead of error document
 */
function xml (str) {
  return (new DOMParser()).parseFromString(str, 'text/xml')
}

function toCamel (str) {
  return str.charAt(0).toLowerCase() + str.substr(1)
}

/**
 * S3 Error constructor
 */
function S3Error (obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) this[key] = obj[key]
  }
}

S3Error.prototype.toString = function () {
  return this.message
}
