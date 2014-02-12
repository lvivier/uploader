
/**
 * Dependencies
 */
var emitter = require('emitter')
var Upload = require('s3')
var o = require('dom')

/**
 * Uploader
 */
module.exports = Uploader

function Uploader (el, opts) {

  if (!(this instanceof Uploader)) return new Uploader(el, opts)

  this.el = el || o('<div/>')[0]
  this.opts = opts || {};

  this.url = (typeof opts.url !== 'undefined') ? opts.url : '';
  this.name = (typeof opts.name !== 'undefined') ? opts.name : 'uploads[]';

  emitter(this)
  render(this.el, this.url)

  // ui binds
  o('input', this.el)
    .on('change', this.upload.bind(this))
    .on('dragenter', hover)
    .on('dragleave', hover)
    .on('drop', hover)

  this.emit('ready')

  return this;
}

/**
 * Upload an image
 * @api private
 */
Uploader.prototype.upload = function (e) {
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
    self.emit('complete', self);
  })
}

/**
 * Append avatar to an element
 */
Uploader.prototype.appendTo = function (el) {
    o(el).parent().insert(this.el);
}

/**
 * Change the class of the current el
 */
Uploader.prototype.addClass = function(c) {
  o(this.el).addClass(c);
};

/**
 * Set the image URL
 */
Uploader.prototype.set = function (url) {
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
    .addClass('uploader')
    .css('background-image', bg(url))
    .append('<input type=file name=uploader[]>')
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
