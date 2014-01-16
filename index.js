
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

function Avatar (el, opts) {
  if (!(this instanceof Avatar)) return new Avatar(el, opts)

  opts = opts || {}

  this.el = el
  this.url = opts.url || ''

  emitter(this)
  render(this.el)

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
 * Set the image URL
 */
Avatar.prototype.set = function (url) {
  o(this.el).css('background-image', 'url(%s)'.replace('%s', url))
  this.url = url
  this.emit('change', this)
  return this
}

/**
 * Render the avatar
 */
function render (el) {
  o(el)
    .addClass('avatar')
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
