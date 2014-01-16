
/**
 * Dependencies
 */
var emitter = require('emitter')
var Upload = require('s3')
var o = require('dom')

/**
 * Avatar
 */
module.exports = Avatar

function Avatar (el, url) {
  if (!(this instanceof Avatar)) return new Avatar(el, url)

  this.el = el || o('<div/>')[0]
  this.url = url || ''

  emitter(this)
  render(this.el, this.url)

  // ui binds
  o('input', this.el)
    .on('change', this.upload.bind(this))
    .on('dragenter', hover)
    .on('dragleave', hover)
    .on('drop', hover)

  this.emit('ready')
}

/**
 * Upload an image
 * @api private
 */
Avatar.prototype.upload = function (e) {
  var uid = Math.random() * 1e10 | 0
  var file = (e.target.files)[0]
  var name = 'uploads/' + uid
  var self = this

  if (!file || file.type && !~file.type.indexOf('image')) return
  this.emit('upload', file, this)

  var upload = Upload(file, {name:name})
  upload.end(function (err) {
    if (err) throw err
    if (upload.url) self.set(upload.url)
  })
}

/**
 * Append avatar to an element
 */
Avatar.prototype.appendTo = function (el) {
  el.parentNode
    .appendChild(this.el)
}

/**
 * Set the image URL
 */
Avatar.prototype.set = function (url) {
  o(this.el).css('background-image', bg(url))
  this.url = url
  this.emit('change', this)
  return this
}

/**
 * Render the avatar
 */
function render (el, url) {
  o(el)
    .addClass('avatar')
    .css('background-image', bg(url))
    .append('<input type=file name=avatar>')
}

/**
 * Toggle hover class for drag events
 */
function hover (ev) {
  o(ev.target)
    .parent()
    .toggleClass('drop')
}

function bg (url) {
  return 'url(%s)'.replace('%s', url)
}
