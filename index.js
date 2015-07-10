
/**
 * Dependencies
 */
var emitter = require('emitter')
var Upload = require('s3')
var error = require('./error')
var o = require('dom')

require('./uploader.css')

/**
 * Uploader
 */
module.exports = Uploader

function Uploader (el, opts) {

  if (!(this instanceof Uploader)) return new Uploader(el, opts)

  this.el = o(el || '<div/>')[0]
  this.opts = opts || {}

  this.url = (opts && typeof opts.url !== 'undefined') ? opts.url : ''
  this.name = (opts && typeof opts.name !== 'undefined') ? opts.name : 'uploads[]'

  emitter(this)
  render(this.el, this.url, this.name)

  // ui binds
  o('input', this.el)
    .on('change', this.upload.bind(this))
    .on('dragenter', hover)
    .on('dragleave', hover)
    .on('drop', hover)

  this.emit('ready')

  return this
}

/**
 * Upload an image
 * @api private
 */
Uploader.prototype.upload = function (e) {
  var uid = Math.random() * 1e10 | 0
  var file = (e.target.files)[0]
  var name = 'uploads/' + uid

  if (!file || file.type && !~file.type.indexOf('image')) return
  this.emit('upload', file, this)

  var upload = new Upload(file, {name:name})
  var self = this

  upload.end(function (err) {
    if (err && err.message.match(/<Error>/)) err = error(err.message)
    if (err) return self.emit('error', err)
    if (upload.url) self.set(upload.url)
    self.emit('complete', self)
  })
}

/**
 * Append uploader to an element
 */
Uploader.prototype.appendTo = function (el) {
  el.parentNode
    .appendChild(this.el)
  return this
}

/**
 * Change the class of the current el
 */
Uploader.prototype.addClass = function(c) {
  o(this.el)
    .addClass(c)
  return this
}

/**
 * Set the image URL
 */
Uploader.prototype.set = function (url) {
  o(this.el).css('backgroundImage', bg(url))
  this.url = url
  this.emit('change', this)
  return this
}

/**
 * Render the avatar
 */
function render (el, url, name) {
  o(el)
    .addClass('uploader')
    .css('backgroundImage', bg(url))
    .append('<input type=file name='+name+'>')
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
