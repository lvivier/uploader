(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Uploader = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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

},{}],2:[function(require,module,exports){

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

},{"./error":1,"./uploader.css":50,"dom":4,"emitter":47,"s3":48}],3:[function(require,module,exports){
'use strict';
// For more information about browser field, check out the browser field at https://github.com/substack/browserify-handbook#browser-field.

module.exports = {
    // Create a <link> tag with optional data attributes
    createLink: function(href, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var link = document.createElement('link');

        link.href = href;
        link.rel = 'stylesheet';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            link.setAttribute('data-' + key, value);
        }

        head.appendChild(link);
    },
    // Create a <style> tag with optional data attributes
    createStyle: function(cssText, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            style.setAttribute('data-' + key, value);
        }
        
        if (style.sheet) { // for jsdom and IE9+
            style.innerHTML = cssText;
            style.sheet.cssText = cssText;
            head.appendChild(style);
        } else if (style.styleSheet) { // for IE8 and below
            head.appendChild(style);
            style.styleSheet.cssText = cssText;
        } else { // for Chrome, Firefox, and Safari
            style.appendChild(document.createTextNode(cssText));
            head.appendChild(style);
        }
    }
};

},{}],4:[function(require,module,exports){
/**
 * Module dependencies.
 */

var domify = require('domify');
var each = require('each');
var events = require('event');
var getKeys = require('keys');
var query = require('query');
var trim = require('trim');
var slice = [].slice;

var isArray = Array.isArray || function (val) {
  return !! val && '[object Array]' === Object.prototype.toString.call(val);
};

/**
 * Attributes supported.
 */

var attrs = [
  'id',
  'src',
  'rel',
  'cols',
  'rows',
  'type',
  'name',
  'href',
  'title',
  'style',
  'width',
  'height',
  'action',
  'method',
  'tabindex',
  'placeholder'
];

/*
 * A simple way to check for HTML strings or ID strings
 */

var quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;

/**
 * Expose `dom()`.
 */

module.exports = dom;

/**
 * Return a dom `List` for the given
 * `html`, selector, or element.
 *
 * @param {String|Element|List} selector
 * @param {String|ELement|context} context
 * @return {List}
 * @api public
 */

function dom(selector, context) {
  // array
  if (isArray(selector)) {
    return new List(selector);
  }

  // List
  if (selector instanceof List) {
    return selector;
  }

  // node
  if (selector.nodeName) {
    return new List([selector]);
  }

  if ('string' != typeof selector) {
    throw new TypeError('invalid selector');
  }

  // html
  var htmlselector = trim.left(selector);
  if (isHTML(htmlselector)) {
    return new List([domify(htmlselector)], htmlselector);
  }

  // selector
  var ctx = context
    ? (context instanceof List ? context[0] : context)
    : document;

  return new List(query.all(selector, ctx), selector);
}

/**
 * Static: Expose `List`
 */

dom.List = List;

/**
 * Static: Expose supported attrs.
 */

dom.attrs = attrs;

/**
 * Static: Mixin a function
 *
 * @param {Object|String} name
 * @param {Object|Function} obj
 * @return {List} self
 */

dom.use = function(name, fn) {
  var keys = [];
  var tmp;

  if (2 == arguments.length) {
    keys.push(name);
    tmp = {};
    tmp[name] = fn;
    fn = tmp;
  } else if (name.name) {
    // use function name
    fn = name;
    name = name.name;
    keys.push(name);
    tmp = {};
    tmp[name] = fn;
    fn = tmp;
  } else {
    keys = getKeys(name);
    fn = name;
  }

  for(var i = 0, len = keys.length; i < len; i++) {
    List.prototype[keys[i]] = fn[keys[i]];
  }

  return this;
}

/**
 * Initialize a new `List` with the
 * given array-ish of `els` and `selector`
 * string.
 *
 * @param {Mixed} els
 * @param {String} selector
 * @api private
 */

function List(els, selector) {
  els = els || [];
  var len = this.length = els.length;
  for(var i = 0; i < len; i++) this[i] = els[i];
  this.selector = selector;
}

/**
 * Remake the list
 *
 * @param {String|ELement|context} context
 * @return {List}
 * @api private
 */

List.prototype.dom = dom;

/**
 * Make `List` an array-like object
 */

List.prototype.length = 0;
List.prototype.splice = Array.prototype.splice;

/**
 * Array-like object to array
 *
 * @return {Array}
 */

List.prototype.toArray = function() {
  return slice.call(this);
}

/**
 * Attribute accessors.
 */

each(attrs, function(name){
  List.prototype[name] = function(val){
    if (0 == arguments.length) return this.attr(name);
    return this.attr(name, val);
  };
});

/**
 * Mixin the API
 */

dom.use(require('./lib/attributes'));
dom.use(require('./lib/classes'));
dom.use(require('./lib/events'));
dom.use(require('./lib/manipulate'));
dom.use(require('./lib/traverse'));

/**
 * Check if the string is HTML
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

function isHTML(str) {
  // Faster than running regex, if str starts with `<` and ends with `>`, assume it's HTML
  if (str.charAt(0) === '<' && str.charAt(str.length - 1) === '>' && str.length >= 3) return true;

  // Run the regex
  var match = quickExpr.exec(str);
  return !!(match && match[1]);
}

},{"./lib/attributes":5,"./lib/classes":6,"./lib/events":7,"./lib/manipulate":8,"./lib/traverse":9,"domify":38,"each":32,"event":34,"keys":40,"query":35,"trim":45}],5:[function(require,module,exports){
/**
 * Module Dependencies
 */

var value = require('value');

/**
 * Set attribute `name` to `val`, or get attr `name`.
 *
 * @param {String} name
 * @param {String} [val]
 * @return {String|List} self
 * @api public
 */

exports.attr = function(name, val){
  // get
  if (1 == arguments.length) {
    return this[0] && this[0].getAttribute(name);
  }

  // remove
  if (null == val) {
    return this.removeAttr(name);
  }

  // set
  return this.forEach(function(el){
    el.setAttribute(name, val);
  });
};

/**
 * Remove attribute `name`.
 *
 * @param {String} name
 * @return {List} self
 * @api public
 */

exports.removeAttr = function(name){
  return this.forEach(function(el){
    el.removeAttribute(name);
  });
};

/**
 * Set property `name` to `val`, or get property `name`.
 *
 * @param {String} name
 * @param {String} [val]
 * @return {Object|List} self
 * @api public
 */

exports.prop = function(name, val){
  if (1 == arguments.length) {
    return this[0] && this[0][name];
  }

  return this.forEach(function(el){
    el[name] = val;
  });
};

/**
 * Get the first element's value or set selected
 * element values to `val`.
 *
 * @param {Mixed} [val]
 * @return {Mixed}
 * @api public
 */

exports.val =
exports.value = function(val){
  if (0 == arguments.length) {
    return this[0]
      ? value(this[0])
      : undefined;
  }

  return this.forEach(function(el){
    value(el, val);
  });
};

},{"value":36}],6:[function(require,module,exports){
/**
 * Module Dependencies
 */

var classes = require('classes');

/**
 * Add the given class `name`.
 *
 * @param {String} name
 * @return {List} self
 * @api public
 */

exports.addClass = function(name){
  return this.forEach(function(el) {
    el._classes = el._classes || classes(el);
    el._classes.add(name);
  });
};

/**
 * Remove the given class `name`.
 *
 * @param {String|RegExp} name
 * @return {List} self
 * @api public
 */

exports.removeClass = function(name){
  return this.forEach(function(el) {
    el._classes = el._classes || classes(el);
    el._classes.remove(name);
  });
};

/**
 * Toggle the given class `name`,
 * optionally a `bool` may be given
 * to indicate that the class should
 * be added when truthy.
 *
 * @param {String} name
 * @param {Boolean} bool
 * @return {List} self
 * @api public
 */

exports.toggleClass = function(name, bool){
  var fn = 'toggle';

  // toggle with boolean
  if (2 == arguments.length) {
    fn = bool ? 'add' : 'remove';
  }

  return this.forEach(function(el) {
    el._classes = el._classes || classes(el);
    el._classes[fn](name);
  })
};

/**
 * Check if the given class `name` is present.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

exports.hasClass = function(name){
  var el;

  for(var i = 0, len = this.length; i < len; i++) {
    el = this[i];
    el._classes = el._classes || classes(el);
    if (el._classes.has(name)) return true;
  }

  return false;
};

},{"classes":10}],7:[function(require,module,exports){
/**
 * Module Dependencies
 */

var events = require('event');
var delegate = require('delegate');

/**
 * Bind to `event` and invoke `fn(e)`. When
 * a `selector` is given then events are delegated.
 *
 * @param {String} event
 * @param {String} [selector]
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {List}
 * @api public
 */

exports.on = function(event, selector, fn, capture){
  if ('string' == typeof selector) {
    return this.forEach(function (el) {
      fn._delegate = delegate.bind(el, selector, event, fn, capture);
    });
  }

  capture = fn;
  fn = selector;

  return this.forEach(function (el) {
    events.bind(el, event, fn, capture);
  });
};

/**
 * Unbind to `event` and invoke `fn(e)`. When
 * a `selector` is given then delegated event
 * handlers are unbound.
 *
 * @param {String} event
 * @param {String} [selector]
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {List}
 * @api public
 */

exports.off = function(event, selector, fn, capture){
  if ('string' == typeof selector) {
    return this.forEach(function (el) {
      // TODO: add selector support back
      delegate.unbind(el, event, fn._delegate, capture);
    });
  }

  capture = fn;
  fn = selector;

  return this.forEach(function (el) {
    events.unbind(el, event, fn, capture);
  });
};

},{"delegate":29,"event":34}],8:[function(require,module,exports){
/**
 * Module Dependencies
 */

var value = require('value');
var css = require('css');
var text = require('text');

/**
 * Return element text.
 *
 * @param {String} str
 * @return {String|List}
 * @api public
 */

exports.text = function(str) {
  if (1 == arguments.length) {
    return this.forEach(function(el) {
      if (11 == el.nodeType) {
        var node;
        while (node = el.firstChild) el.removeChild(node);
        el.appendChild(document.createTextNode(str));
      } else {
        text(el, str);
      }
    });
  }

  var out = '';
  this.forEach(function(el) {
    if (11 == el.nodeType) {
      out += getText(el.firstChild);
    } else {
      out += text(el);
    }
  });

  return out;
};

/**
 * Get text helper from Sizzle.
 *
 * Source: https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L914-L947
 *
 * @param {Element|Array} el
 * @return {String}
 */

function getText(el) {
  var ret = '';
  var type = el.nodeType;
  var node;

  switch(type) {
    case 1:
    case 9:
      ret = text(el);
      break;
    case 11:
      ret = el.textContent || el.innerText;
      break;
    case 3:
    case 4:
      return el.nodeValue;
    default:
      while (node = el[i++]) {
        ret += getText(node);
      }
  }

  return ret;
}

/**
 * Return element html.
 *
 * @return {String} html
 * @api public
 */

exports.html = function(html) {
  if (1 == arguments.length) {
    return this.forEach(function(el) {
      el.innerHTML = html;
    });
  }

  // TODO: real impl
  return this[0] && this[0].innerHTML;
};

/**
 * Get and set the css value
 *
 * @param {String|Object} prop
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

exports.css = function(prop, val) {
  // getter
  if (!val && 'object' != typeof prop) {
    return css(this[0], prop);
  }
  // setter
  this.forEach(function(el) {
    css(el, prop, val);
  });

  return this;
};

/**
 * Prepend `val`.
 *
 * From jQuery: if there is more than one target element
 * cloned copies of the inserted element will be created
 * for each target after the first.
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.prepend = function(val) {
  var dom = this.dom;

  this.forEach(function(target, i) {
    dom(val).forEach(function(selector) {
      selector = i ? selector.cloneNode(true) : selector;
      if (target.children.length) {
        target.insertBefore(selector, target.firstChild);
      } else {
        target.appendChild(selector);
      }
    });
  });

  return this;
};

/**
 * Append `val`.
 *
 * From jQuery: if there is more than one target element
 * cloned copies of the inserted element will be created
 * for each target after the first.
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.append = function(val) {
  var dom = this.dom;

  this.forEach(function(target, i) {
    dom(val).forEach(function(el) {
      el = i ? el.cloneNode(true) : el;
      target.appendChild(el);
    });
  });

  return this;
};

/**
 * Insert self's `els` after `val`
 *
 * From jQuery: if there is more than one target element,
 * cloned copies of the inserted element will be created
 * for each target after the first, and that new set
 * (the original element plus clones) is returned.
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.insertAfter = function(val) {
  var dom = this.dom;

  this.forEach(function(el) {
    dom(val).forEach(function(target, i) {
      if (!target.parentNode) return;
      el = i ? el.cloneNode(true) : el;
      target.parentNode.insertBefore(el, target.nextSibling);
    });
  });

  return this;
};

/**
 * Append self's `el` to `val`
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.appendTo = function(val) {
  this.dom(val).append(this);
  return this;
};

/**
 * Replace elements in the DOM.
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

exports.replace = function(val) {
  var self = this;
  var list = this.dom(val);

  list.forEach(function(el, i) {
    var old = self[i];
    var parent = old.parentNode;
    if (!parent) return;
    el = i ? el.cloneNode(true) : el;
    parent.replaceChild(el, old);
  });

  return this;
};

/**
 * Empty the dom list
 *
 * @return self
 * @api public
 */

exports.empty = function() {
  return this.forEach(function(el) {
    text(el, "");
  });
};

/**
 * Remove all elements in the dom list
 *
 * @return {List} self
 * @api public
 */

exports.remove = function() {
  return this.forEach(function(el) {
    var parent = el.parentNode;
    if (parent) parent.removeChild(el);
  });
};

/**
 * Return a cloned dom list with all elements cloned.
 *
 * @return {List}
 * @api public
 */

exports.clone = function() {
  var out = this.map(function(el) {
    return el.cloneNode(true);
  });

  return this.dom(out);
};

/**
 * Focus the first dom element in our list.
 * 
 * @return {List} self
 * @api public
 */

exports.focus = function(){
  this[0].focus();
  return this;
};

},{"css":12,"text":42,"value":36}],9:[function(require,module,exports){
/**
 * Module Dependencies
 */

var proto = Array.prototype;
var each = require('each');
var traverse = require('traverse');
var toFunction = require('to-function');
var matches = require('matches-selector');

/**
 * Find children matching the given `selector`.
 *
 * @param {String} selector
 * @return {List}
 * @api public
 */

exports.find = function(selector){
  return this.dom(selector, this);
};

/**
 * Check if the any element in the selection
 * matches `selector`.
 *
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

exports.is = function(selector){
  for(var i = 0, el; el = this[i]; i++) {
    if (matches(el, selector)) return true;
  }

  return false;
};

/**
 * Get parent(s) with optional `selector` and `limit`
 *
 * @param {String} selector
 * @param {Number} limit
 * @return {List}
 * @api public
 */

exports.parent = function(selector, limit){
  return this.dom(traverse('parentNode',
    this[0],
    selector,
    limit
    || 1));
};

/**
 * Get next element(s) with optional `selector` and `limit`.
 *
 * @param {String} selector
 * @param {Number} limit
 * @retrun {List}
 * @api public
 */

exports.next = function(selector, limit){
  return this.dom(traverse('nextSibling',
    this[0],
    selector,
    limit
    || 1));
};

/**
 * Get previous element(s) with optional `selector` and `limit`.
 *
 * @param {String} selector
 * @param {Number} limit
 * @return {List}
 * @api public
 */

exports.prev =
exports.previous = function(selector, limit){
  return this.dom(traverse('previousSibling',
    this[0],
    selector,
    limit
    || 1));
};

/**
 * Iterate over each element creating a new list with
 * one item and invoking `fn(list, i)`.
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

exports.each = function(fn){
  var dom = this.dom;

  for (var i = 0, list, len = this.length; i < len; i++) {
    list = dom(this[i]);
    fn.call(list, list, i);
  }

  return this;
};

/**
 * Iterate over each element and invoke `fn(el, i)`
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

exports.forEach = function(fn) {
  for (var i = 0, len = this.length; i < len; i++) {
    fn.call(this[i], this[i], i);
  }

  return this;
};

/**
 * Map each return value from `fn(val, i)`.
 *
 * Passing a callback function:
 *
 *    inputs.map(function(input){
 *      return input.type
 *    })
 *
 * Passing a property string:
 *
 *    inputs.map('type')
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

exports.map = function(fn){
  fn = toFunction(fn);
  var dom = this.dom;
  var out = [];

  for (var i = 0, len = this.length; i < len; i++) {
    out.push(fn.call(dom(this[i]), this[i], i));
  }

  return this.dom(out);
};

/**
 * Select all values that return a truthy value of `fn(val, i)`.
 *
 *    inputs.select(function(input){
 *      return input.type == 'password'
 *    })
 *
 *  With a property:
 *
 *    inputs.select('type == password')
 *
 * @param {Function|String} fn
 * @return {List} self
 * @api public
 */

exports.filter =
exports.select = function(fn){
  fn = toFunction(fn);
  var dom = this.dom;
  var out = [];
  var val;

  for (var i = 0, len = this.length; i < len; i++) {
    val = fn.call(dom(this[i]), this[i], i);
    if (val) out.push(this[i]);
  }

  return this.dom(out);
};

/**
 * Reject all values that return a truthy value of `fn(val, i)`.
 *
 * Rejecting using a callback:
 *
 *    input.reject(function(user){
 *      return input.length < 20
 *    })
 *
 * Rejecting with a property:
 *
 *    items.reject('password')
 *
 * Rejecting values via `==`:
 *
 *    data.reject(null)
 *    input.reject(file)
 *
 * @param {Function|String|Mixed} fn
 * @return {List}
 * @api public
 */

exports.reject = function(fn){
  var dom = this.dom;
  var out = [];
  var len = this.length;
  var val, i;

  if ('string' == typeof fn) fn = toFunction(fn);

  if (fn) {
    for (i = 0; i < len; i++) {
      val = fn.call(dom(this[i]), this[i], i);
      if (!val) out.push(this[i]);
    }
  } else {
    for (i = 0; i < len; i++) {
      if (this[i] != fn) out.push(this[i]);
    }
  }

  return this.dom(out);
};

/**
 * Return a `List` containing the element at `i`.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

exports.at = function(i){
  return this.dom(this[i]);
};

/**
 * Return a `List` containing the first element.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

exports.first = function(){
  return this.dom(this[0]);
};

/**
 * Return a `List` containing the last element.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

exports.last = function(){
  return this.dom(this[this.length - 1]);
};

/**
 * Mixin the array functions
 */

each([
  'push',
  'pop',
  'shift',
  'splice',
  'unshift',
  'reverse',
  'sort',
  'toString',
  'concat',
  'join',
  'slice'
], function(method) {
  exports[method] = function() {
    return proto[method].apply(this.toArray(), arguments);
  };
});

},{"each":32,"matches-selector":39,"to-function":43,"traverse":46}],10:[function(require,module,exports){
/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el || !el.nodeType) {
    throw new Error('A DOM element reference is required');
  }
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`, can force state via `force`.
 *
 * For browsers that support classList, but do not support `force` yet,
 * the mistake will be detected and corrected.
 *
 * @param {String} name
 * @param {Boolean} force
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name, force){
  // classList
  if (this.list) {
    if ("undefined" !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  }

  // fallback
  if ("undefined" !== typeof force) {
    if (!force) {
      this.remove(name);
    } else {
      this.add(name);
    }
  } else {
    if (this.has(name)) {
      this.remove(name);
    } else {
      this.add(name);
    }
  }

  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

},{"indexof":11}],11:[function(require,module,exports){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],12:[function(require,module,exports){
/**
 * Module Dependencies
 */

var debug = require('debug')('css');
var set = require('./lib/style');
var get = require('./lib/css');

/**
 * Expose `css`
 */

module.exports = css;

/**
 * Get and set css values
 *
 * @param {Element} el
 * @param {String|Object} prop
 * @param {Mixed} val
 * @return {Element} el
 * @api public
 */

function css(el, prop, val) {
  if (!el) return;

  if (undefined !== val) {
    var obj = {};
    obj[prop] = val;
    debug('setting styles %j', obj);
    return setStyles(el, obj);
  }

  if ('object' == typeof prop) {
    debug('setting styles %j', prop);
    return setStyles(el, prop);
  }

  debug('getting %s', prop);
  return get(el, prop);
}

/**
 * Set the styles on an element
 *
 * @param {Element} el
 * @param {Object} props
 * @return {Element} el
 */

function setStyles(el, props) {
  for (var prop in props) {
    set(el, prop, props[prop]);
  }

  return el;
}

},{"./lib/css":14,"./lib/style":17,"debug":22}],13:[function(require,module,exports){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:computed');
var withinDocument = require('within-document');
var styles = require('./styles');

/**
 * Expose `computed`
 */

module.exports = computed;

/**
 * Get the computed style
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Array} precomputed (optional)
 * @return {Array}
 * @api private
 */

function computed(el, prop, precomputed) {
  var computed = precomputed || styles(el);
  var ret;
  
  if (!computed) return;

  if (computed.getPropertyValue) {
    ret = computed.getPropertyValue(prop) || computed[prop];
  } else {
    ret = computed[prop];
  }

  if ('' === ret && !withinDocument(el)) {
    debug('element not within document, try finding from style attribute');
    var style = require('./style');
    ret = style(el, prop);
  }

  debug('computed value of %s: %s', prop, ret);

  // Support: IE
  // IE returns zIndex value as an integer.
  return undefined === ret ? ret : ret + '';
}

},{"./style":17,"./styles":18,"debug":22,"within-document":28}],14:[function(require,module,exports){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:css');
var camelcase = require('to-camel-case');
var computed = require('./computed');
var property = require('./prop');

/**
 * Expose `css`
 */

module.exports = css;

/**
 * CSS Normal Transforms
 */

var cssNormalTransform = {
  letterSpacing: 0,
  fontWeight: 400
};

/**
 * Get a CSS value
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @param {Array} styles
 * @return {String}
 */

function css(el, prop, extra, styles) {
  var hooks = require('./hooks');
  var orig = camelcase(prop);
  var style = el.style;
  var val;

  prop = property(prop, style);
  var hook = hooks[prop] || hooks[orig];

  // If a hook was provided get the computed value from there
  if (hook && hook.get) {
    debug('get hook provided. use that');
    val = hook.get(el, true, extra);
  }

  // Otherwise, if a way to get the computed value exists, use that
  if (undefined == val) {
    debug('fetch the computed value of %s', prop);
    val = computed(el, prop);
  }

  if ('normal' == val && cssNormalTransform[prop]) {
    val = cssNormalTransform[prop];
    debug('normal => %s', val);
  }

  // Return, converting to number if forced or a qualifier was provided and val looks numeric
  if ('' == extra || extra) {
    debug('converting value: %s into a number', val);
    var num = parseFloat(val);
    return true === extra || isNumeric(num) ? num || 0 : val;
  }

  return val;
}

/**
 * Is Numeric
 *
 * @param {Mixed} obj
 * @return {Boolean}
 */

function isNumeric(obj) {
  return !isNan(parseFloat(obj)) && isFinite(obj);
}

},{"./computed":13,"./hooks":15,"./prop":16,"debug":22,"to-camel-case":25}],15:[function(require,module,exports){
/**
 * Module Dependencies
 */

var each = require('each');
var css = require('./css');
var cssShow = { position: 'absolute', visibility: 'hidden', display: 'block' };
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;
var rnumnonpx = new RegExp( '^(' + pnum + ')(?!px)[a-z%]+$', 'i');
var rnumsplit = new RegExp( '^(' + pnum + ')(.*)$', 'i');
var rdisplayswap = /^(none|table(?!-c[ea]).+)/;
var styles = require('./styles');
var support = require('./support');
var swap = require('./swap');
var computed = require('./computed');
var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

/**
 * Height & Width
 */

each(['width', 'height'], function(name) {
  exports[name] = {};

  exports[name].get = function(el, compute, extra) {
    if (!compute) return;
    // certain elements can have dimension info if we invisibly show them
    // however, it must have a current display style that would benefit from this
    return 0 == el.offsetWidth && rdisplayswap.test(css(el, 'display'))
      ? swap(el, cssShow, function() { return getWidthOrHeight(el, name, extra); })
      : getWidthOrHeight(el, name, extra);
  }

  exports[name].set = function(el, val, extra) {
    var styles = extra && styles(el);
    return setPositiveNumber(el, val, extra
      ? augmentWidthOrHeight(el, name, extra, 'border-box' == css(el, 'boxSizing', false, styles), styles)
      : 0
    );
  };

});

/**
 * Opacity
 */

exports.opacity = {};
exports.opacity.get = function(el, compute) {
  if (!compute) return;
  var ret = computed(el, 'opacity');
  return '' == ret ? '1' : ret;
}

/**
 * Utility: Set Positive Number
 *
 * @param {Element} el
 * @param {Mixed} val
 * @param {Number} subtract
 * @return {Number}
 */

function setPositiveNumber(el, val, subtract) {
  var matches = rnumsplit.exec(val);
  return matches ?
    // Guard against undefined 'subtract', e.g., when used as in cssHooks
    Math.max(0, matches[1]) + (matches[2] || 'px') :
    val;
}

/**
 * Utility: Get the width or height
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @return {String}
 */

function getWidthOrHeight(el, prop, extra) {
  // Start with offset property, which is equivalent to the border-box value
  var valueIsBorderBox = true;
  var val = prop === 'width' ? el.offsetWidth : el.offsetHeight;
  var styles = computed(el);
  var isBorderBox = support.boxSizing && css(el, 'boxSizing') === 'border-box';

  // some non-html elements return undefined for offsetWidth, so check for null/undefined
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
  if (val <= 0 || val == null) {
    // Fall back to computed then uncomputed css if necessary
    val = computed(el, prop, styles);

    if (val < 0 || val == null) {
      val = el.style[prop];
    }

    // Computed unit is not pixels. Stop here and return.
    if (rnumnonpx.test(val)) {
      return val;
    }

    // we need the check for style in case a browser which returns unreliable values
    // for getComputedStyle silently falls back to the reliable el.style
    valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === el.style[prop]);

    // Normalize ', auto, and prepare for extra
    val = parseFloat(val) || 0;
  }

  // use the active box-sizing model to add/subtract irrelevant styles
  extra = extra || (isBorderBox ? 'border' : 'content');
  val += augmentWidthOrHeight(el, prop, extra, valueIsBorderBox, styles);
  return val + 'px';
}

/**
 * Utility: Augment the width or the height
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} extra
 * @param {Boolean} isBorderBox
 * @param {Array} styles
 */

function augmentWidthOrHeight(el, prop, extra, isBorderBox, styles) {
  // If we already have the right measurement, avoid augmentation,
  // Otherwise initialize for horizontal or vertical properties
  var i = extra === (isBorderBox ? 'border' : 'content') ? 4 : 'width' == prop ? 1 : 0;
  var val = 0;

  for (; i < 4; i += 2) {
    // both box models exclude margin, so add it if we want it
    if (extra === 'margin') {
      val += css(el, extra + cssExpand[i], true, styles);
    }

    if (isBorderBox) {
      // border-box includes padding, so remove it if we want content
      if (extra === 'content') {
        val -= css(el, 'padding' + cssExpand[i], true, styles);
      }

      // at this point, extra isn't border nor margin, so remove border
      if (extra !== 'margin') {
        val -= css(el, 'border' + cssExpand[i] + 'Width', true, styles);
      }
    } else {
      // at this point, extra isn't content, so add padding
      val += css(el, 'padding' + cssExpand[i], true, styles);

      // at this point, extra isn't content nor padding, so add border
      if (extra !== 'padding') {
        val += css(el, 'border' + cssExpand[i] + 'Width', true, styles);
      }
    }
  }

  return val;
}

},{"./computed":13,"./css":14,"./styles":18,"./support":19,"./swap":20,"each":32}],16:[function(require,module,exports){
/**
 * Module dependencies
 */

var debug = require('debug')('css:prop');
var camelcase = require('to-camel-case');
var vendor = require('./vendor');

/**
 * Export `prop`
 */

module.exports = prop;

/**
 * Normalize Properties
 */

var cssProps = {
  'float': 'cssFloat' in document.documentElement.style ? 'cssFloat' : 'styleFloat'
};

/**
 * Get the vendor prefixed property
 *
 * @param {String} prop
 * @param {String} style
 * @return {String} prop
 * @api private
 */

function prop(prop, style) {
  prop = cssProps[prop] || (cssProps[prop] = vendor(prop, style));
  debug('transform property: %s => %s', prop, style);
  return prop;
}

},{"./vendor":21,"debug":22,"to-camel-case":25}],17:[function(require,module,exports){
/**
 * Module Dependencies
 */

var debug = require('debug')('css:style');
var camelcase = require('to-camel-case');
var support = require('./support');
var property = require('./prop');
var hooks = require('./hooks');

/**
 * Expose `style`
 */

module.exports = style;

/**
 * Possibly-unitless properties
 *
 * Don't automatically add 'px' to these properties
 */

var cssNumber = {
  "columnCount": true,
  "fillOpacity": true,
  "fontWeight": true,
  "lineHeight": true,
  "opacity": true,
  "order": true,
  "orphans": true,
  "widows": true,
  "zIndex": true,
  "zoom": true
};

/**
 * Set a css value
 *
 * @param {Element} el
 * @param {String} prop
 * @param {Mixed} val
 * @param {Mixed} extra
 */

function style(el, prop, val, extra) {
  // Don't set styles on text and comment nodes
  if (!el || el.nodeType === 3 || el.nodeType === 8 || !el.style ) return;

  var orig = camelcase(prop);
  var style = el.style;
  var type = typeof val;

  if (!val) return get(el, prop, orig, extra);

  prop = property(prop, style);

  var hook = hooks[prop] || hooks[orig];

  // If a number was passed in, add 'px' to the (except for certain CSS properties)
  if ('number' == type && !cssNumber[orig]) {
    debug('adding "px" to end of number');
    val += 'px';
  }

  // Fixes jQuery #8908, it can be done more correctly by specifying setters in cssHooks,
  // but it would mean to define eight (for every problematic property) identical functions
  if (!support.clearCloneStyle && '' === val && 0 === prop.indexOf('background')) {
    debug('set property (%s) value to "inherit"', prop);
    style[prop] = 'inherit';
  }

  // If a hook was provided, use that value, otherwise just set the specified value
  if (!hook || !hook.set || undefined !== (val = hook.set(el, val, extra))) {
    // Support: Chrome, Safari
    // Setting style to blank string required to delete "style: x !important;"
    debug('set hook defined. setting property (%s) to %s', prop, val);
    style[prop] = '';
    style[prop] = val;
  }

}

/**
 * Get the style
 *
 * @param {Element} el
 * @param {String} prop
 * @param {String} orig
 * @param {Mixed} extra
 * @return {String}
 */

function get(el, prop, orig, extra) {
  var style = el.style;
  var hook = hooks[prop] || hooks[orig];
  var ret;

  if (hook && hook.get && undefined !== (ret = hook.get(el, false, extra))) {
    debug('get hook defined, returning: %s', ret);
    return ret;
  }

  ret = style[prop];
  debug('getting %s', ret);
  return ret;
}

},{"./hooks":15,"./prop":16,"./support":19,"debug":22,"to-camel-case":25}],18:[function(require,module,exports){
/**
 * Expose `styles`
 */

module.exports = styles;

/**
 * Get all the styles
 *
 * @param {Element} el
 * @return {Array}
 */

function styles(el) {
  if (window.getComputedStyle) {
    return el.ownerDocument.defaultView.getComputedStyle(el, null);
  } else {
    return el.currentStyle;
  }
}

},{}],19:[function(require,module,exports){
/**
 * Support values
 */

var reliableMarginRight;
var boxSizingReliableVal;
var pixelPositionVal;
var clearCloneStyle;

/**
 * Container setup
 */

var docElem = document.documentElement;
var container = document.createElement('div');
var div = document.createElement('div');

/**
 * Clear clone style
 */

div.style.backgroundClip = 'content-box';
div.cloneNode(true).style.backgroundClip = '';
exports.clearCloneStyle = div.style.backgroundClip === 'content-box';

container.style.cssText = 'border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px';
container.appendChild(div);

/**
 * Pixel position
 *
 * Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
 * getComputedStyle returns percent when specified for top/left/bottom/right
 * rather than make the css module depend on the offset module, we just check for it here
 */

exports.pixelPosition = function() {
  if (undefined == pixelPositionVal) computePixelPositionAndBoxSizingReliable();
  return pixelPositionVal;
}

/**
 * Reliable box sizing
 */

exports.boxSizingReliable = function() {
  if (undefined == boxSizingReliableVal) computePixelPositionAndBoxSizingReliable();
  return boxSizingReliableVal;
}

/**
 * Reliable margin right
 *
 * Support: Android 2.3
 * Check if div with explicit width and no margin-right incorrectly
 * gets computed margin-right based on width of container. (#3333)
 * WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
 * This support function is only executed once so no memoizing is needed.
 *
 * @return {Boolean}
 */

exports.reliableMarginRight = function() {
  var ret;
  var marginDiv = div.appendChild(document.createElement("div" ));

  marginDiv.style.cssText = div.style.cssText = divReset;
  marginDiv.style.marginRight = marginDiv.style.width = "0";
  div.style.width = "1px";
  docElem.appendChild(container);

  ret = !parseFloat(window.getComputedStyle(marginDiv, null).marginRight);

  docElem.removeChild(container);

  // Clean up the div for other support tests.
  div.innerHTML = "";

  return ret;
}

/**
 * Executing both pixelPosition & boxSizingReliable tests require only one layout
 * so they're executed at the same time to save the second computation.
 */

function computePixelPositionAndBoxSizingReliable() {
  // Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
  div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
    "box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;" +
    "position:absolute;top:1%";
  docElem.appendChild(container);

  var divStyle = window.getComputedStyle(div, null);
  pixelPositionVal = divStyle.top !== "1%";
  boxSizingReliableVal = divStyle.width === "4px";

  docElem.removeChild(container);
}



},{}],20:[function(require,module,exports){
/**
 * Export `swap`
 */

module.exports = swap;

/**
 * Initialize `swap`
 *
 * @param {Element} el
 * @param {Object} options
 * @param {Function} fn
 * @param {Array} args
 * @return {Mixed}
 */

function swap(el, options, fn, args) {
  // Remember the old values, and insert the new ones
  for (var key in options) {
    old[key] = el.style[key];
    el.style[key] = options[key];
  }

  ret = fn.apply(el, args || []);

  // Revert the old values
  for (key in options) {
    el.style[key] = old[key];
  }

  return ret;
}

},{}],21:[function(require,module,exports){
/**
 * Module Dependencies
 */

var prefixes = ['Webkit', 'O', 'Moz', 'ms'];

/**
 * Expose `vendor`
 */

module.exports = vendor;

/**
 * Get the vendor prefix for a given property
 *
 * @param {String} prop
 * @param {Object} style
 * @return {String}
 */

function vendor(prop, style) {
  // shortcut for names that are not vendor prefixed
  if (style[prop]) return prop;

  // check for vendor prefixed names
  var capName = prop[0].toUpperCase() + prop.slice(1);
  var original = prop;
  var i = prefixes.length;

  while (i--) {
    prop = prefixes[i] + capName;
    if (prop in style) return prop;
  }

  return original;
}

},{}],22:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":23}],23:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":24}],24:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],25:[function(require,module,exports){

var toSpace = require('to-space-case');


/**
 * Expose `toCamelCase`.
 */

module.exports = toCamelCase;


/**
 * Convert a `string` to camel case.
 *
 * @param {String} string
 * @return {String}
 */


function toCamelCase (string) {
  return toSpace(string).replace(/\s(\w)/g, function (matches, letter) {
    return letter.toUpperCase();
  });
}
},{"to-space-case":26}],26:[function(require,module,exports){

var clean = require('to-no-case');


/**
 * Expose `toSpaceCase`.
 */

module.exports = toSpaceCase;


/**
 * Convert a `string` to space case.
 *
 * @param {String} string
 * @return {String}
 */


function toSpaceCase (string) {
  return clean(string).replace(/[\W_]+(.|$)/g, function (matches, match) {
    return match ? ' ' + match : '';
  });
}
},{"to-no-case":27}],27:[function(require,module,exports){

/**
 * Expose `toNoCase`.
 */

module.exports = toNoCase;


/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasCamel = /[a-z][A-Z]/;
var hasSeparator = /[\W_]/;


/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase (string) {
  if (hasSpace.test(string)) return string.toLowerCase();

  if (hasSeparator.test(string)) string = unseparate(string);
  if (hasCamel.test(string)) string = uncamelize(string);
  return string.toLowerCase();
}


/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g;


/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate (string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : '';
  });
}


/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g;


/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize (string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}
},{}],28:[function(require,module,exports){

/**
 * Check if `el` is within the document.
 *
 * @param {Element} el
 * @return {Boolean}
 * @api private
 */

module.exports = function(el) {
  var node = el;
  while (node = node.parentNode) {
    if (node == document) return true;
  }
  return false;
};
},{}],29:[function(require,module,exports){
/**
 * Module dependencies.
 */

var closest = require('closest')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

},{"closest":30,"event":34}],30:[function(require,module,exports){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? {parentNode: element} : element

  root = root || document

  // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation
  while ((element = element.parentNode) && element !== document) {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return
  }
}

},{"matches-selector":31}],31:[function(require,module,exports){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (!el || el.nodeType !== 1) return false;
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

},{"query":35}],32:[function(require,module,exports){

/**
 * Module dependencies.
 */

try {
  var type = require('type');
} catch (err) {
  var type = require('component-type');
}

var toFunction = require('to-function');

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`
 * in optional context `ctx`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @param {Object} [ctx]
 * @api public
 */

module.exports = function(obj, fn, ctx){
  fn = toFunction(fn);
  ctx = ctx || this;
  switch (type(obj)) {
    case 'array':
      return array(obj, fn, ctx);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn, ctx);
      return object(obj, fn, ctx);
    case 'string':
      return string(obj, fn, ctx);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function string(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function object(obj, fn, ctx) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn.call(ctx, key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function array(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj[i], i);
  }
}

},{"component-type":33,"to-function":43,"type":33}],33:[function(require,module,exports){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

},{}],34:[function(require,module,exports){
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
},{}],35:[function(require,module,exports){
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

},{}],36:[function(require,module,exports){

/**
 * Module dependencies.
 */

var typeOf = require('type');

/**
 * Set or get `el`'s' value.
 *
 * @param {Element} el
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

module.exports = function(el, val){
  if (2 == arguments.length) return set(el, val);
  return get(el);
};

/**
 * Get `el`'s value.
 */

function get(el) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (el.checked) {
        var attr = el.getAttribute('value');
        return null == attr ? true : attr;
      } else {
        return false;
      }
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        if (radio.checked) return radio.value;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        if (option.selected) return option.value;
      }
      break;
    default:
      return el.value;
  }
}

/**
 * Set `el`'s value.
 */

function set(el, val) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (val) {
        el.checked = true;
      } else {
        el.checked = false;
      }
      break;
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        radio.checked = radio.value === val;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        option.selected = option.value === val;
      }
      break;
    default:
      el.value = val;
  }
}

/**
 * Element type.
 */

function type(el) {
  var group = 'array' == typeOf(el) || 'object' == typeOf(el);
  if (group) el = el[0];
  var name = el.nodeName.toLowerCase();
  var type = el.getAttribute('type');

  if (group && type && 'radio' == type.toLowerCase()) return 'radiogroup';
  if ('input' == name && type && 'checkbox' == type.toLowerCase()) return 'checkbox';
  if ('input' == name && type && 'radio' == type.toLowerCase()) return 'radio';
  if ('select' == name) return 'select';
  return name;
}

},{"type":37}],37:[function(require,module,exports){
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val)

  return typeof val;
};

},{}],38:[function(require,module,exports){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Tests for browser support.
 */

var div = document.createElement('div');
// Setup
div.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
// Make sure that link elements get serialized correctly by innerHTML
// This requires a wrapper element in IE
var innerHTMLBug = !div.getElementsByTagName('link').length;
div = undefined;

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.polyline =
map.ellipse =
map.polygon =
map.circle =
map.text =
map.line =
map.path =
map.rect =
map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

},{}],39:[function(require,module,exports){
'use strict';

var proto = Element.prototype;
var vendor = proto.matches
  || proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = el.parentNode.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] == el) return true;
  }
  return false;
}
},{}],40:[function(require,module,exports){
'use strict';

// modified from https://github.com/es-shims/es5-shim
var has = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var isArgs = require('./isArguments');
var hasDontEnumBug = !({ 'toString': null }).propertyIsEnumerable('toString');
var hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype');
var dontEnums = [
	'toString',
	'toLocaleString',
	'valueOf',
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'constructor'
];

var keysShim = function keys(object) {
	var isObject = object !== null && typeof object === 'object';
	var isFunction = toStr.call(object) === '[object Function]';
	var isArguments = isArgs(object);
	var isString = isObject && toStr.call(object) === '[object String]';
	var theKeys = [];

	if (!isObject && !isFunction && !isArguments) {
		throw new TypeError('Object.keys called on a non-object');
	}

	var skipProto = hasProtoEnumBug && isFunction;
	if (isString && object.length > 0 && !has.call(object, 0)) {
		for (var i = 0; i < object.length; ++i) {
			theKeys.push(String(i));
		}
	}

	if (isArguments && object.length > 0) {
		for (var j = 0; j < object.length; ++j) {
			theKeys.push(String(j));
		}
	} else {
		for (var name in object) {
			if (!(skipProto && name === 'prototype') && has.call(object, name)) {
				theKeys.push(String(name));
			}
		}
	}

	if (hasDontEnumBug) {
		var ctor = object.constructor;
		var skipConstructor = ctor && ctor.prototype === object;

		for (var k = 0; k < dontEnums.length; ++k) {
			if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
				theKeys.push(dontEnums[k]);
			}
		}
	}
	return theKeys;
};

keysShim.shim = function shimObjectKeys() {
	if (!Object.keys) {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

},{"./isArguments":41}],41:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]'
			&& value !== null
			&& typeof value === 'object'
			&& typeof value.length === 'number'
			&& value.length >= 0
			&& toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

},{}],42:[function(require,module,exports){
module.exports = function(node, value) {
  var text = (node.textContent !== undefined ?
    'textContent' : 'innerText'
  )

  if (typeof value != 'undefined') {
    node[text] = value
  }

  return node[text]
}

},{}],43:[function(require,module,exports){

/**
 * Module Dependencies
 */

var expr;
try {
  expr = require('props');
} catch(e) {
  expr = require('component-props');
}

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  };
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  };
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
  return new Function('_', 'return ' + get(str));
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {};
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key]);
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  };
}

/**
 * Built the getter function. Supports getter style functions
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function get(str) {
  var props = expr(str);
  if (!props.length) return '_.' + str;

  var val, i, prop;
  for (i = 0; i < props.length; i++) {
    prop = props[i];
    val = '_.' + prop;
    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";

    // mimic negative lookbehind to avoid problems with nested properties
    str = stripNested(prop, str, val);
  }

  return str;
}

/**
 * Mimic negative lookbehind to avoid problems with nested properties.
 *
 * See: http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
 *
 * @param {String} prop
 * @param {String} str
 * @param {String} val
 * @return {String}
 * @api private
 */

function stripNested (prop, str, val) {
  return str.replace(new RegExp('(\\.)?' + prop, 'g'), function($0, $1) {
    return $1 ? $0 : val;
  });
}

},{"component-props":44,"props":44}],44:[function(require,module,exports){
/**
 * Global Names
 */

var globals = /\b(Array|Date|Object|Math|JSON)\b/g;

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .replace(globals, '')
    .match(/[a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  };
}

},{}],45:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],46:[function(require,module,exports){

/**
 * dependencies
 */

var matches = require('matches-selector');

/**
 * Traverse with the given `el`, `selector` and `len`.
 *
 * @param {String} type
 * @param {Element} el
 * @param {String} selector
 * @param {Number} len
 * @return {Array}
 * @api public
 */

module.exports = function(type, el, selector, len){
  var el = el[type]
    , n = len || 1
    , ret = [];

  if (!el) return ret;

  do {
    if (n == ret.length) break;
    if (1 != el.nodeType) continue;
    if (matches(el, selector)) ret.push(el);
    if (!selector) ret.push(el);
  } while (el = el[type]);

  return ret;
}

},{"matches-selector":39}],47:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],48:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var events = require('event');

/**
 * Expose `Upload`.
 */

module.exports = Upload;

/**
 * Validate global configuration.
 *
 * @api private
 */

function validateConfig() {
  if (!S3.signature) throw new Error('S3.signature required');
  if (!S3.bucket) throw new Error('S3.bucket required');
  if (!S3.policy) throw new Error('S3.policy required');
  if (!S3.key) throw new Error('S3.key required');
  if (!S3.acl) throw new Error('S3.acl required');
}

/**
 * Initialize a new `Upload` file` and options.
 *
 * Options:
 *
 *   - `name` remote filename or `file.name`
 *   - `type` content-type or `file.type` / application/octet-stream
 *
 * Events:
 *
 *   - `error` an error occurred
 *   - `abort` upload was aborted
 *   - `progress` upload in progress (`e.percent` etc)
 *   - `end` upload is complete
 *
 * TODO: progress
 * TODO: add option for max parts
 * TODO: add option for opting-out
 *
 * @param {File} file
 * @param {Object} [options]
 * @api private
 */

function Upload(file, opts) {
  if (!(this instanceof Upload)) return new Upload(file, opts);
  opts = opts || {};
  if (!opts.protocol) opts.protocol = window.location.protocol;
  validateConfig();
  this.file = file;
  this.type = opts.type || file.type || 'application/octet-stream';
  this.name = opts.name || file.name;
  this.bucketUrl = opts.protocol + '//' + S3.bucket + '.s3.amazonaws.com';
  this.url = this.bucketUrl + '/' + this.name;
  this.signature = S3.signature;
  this.bucket = S3.bucket;
  this.policy = S3.policy;
  this.key = S3.key;
  this.acl = S3.acl;
}

/**
 * Mixin emitter.
 */

Emitter(Upload.prototype);

/**
 * Upload the file to s3 and invoke `fn(err)` when complete.
 *
 * @param {Function} [fn]
 * @api public
 */

Upload.prototype.end = function(fn){
  var self = this;
  fn = fn || function(){};

  var xhr = this.xhr = new XMLHttpRequest;

  // TODO: component
  events.bind(xhr.upload, 'progress', function(e){
    e.percent = e.loaded / e.total * 100;
    self.emit('progress', e);
  });

  // TODO: component
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    var t = xhr.status / 100 | 0;
    if (2 == t) return fn();
    var err = new Error(xhr.responseText);
    err.status = xhr.status;
    fn(err);
  };

  // form
  var form = new FormData;
  form.append('key', this.name);
  form.append('AWSAccessKeyId', this.key);
  form.append('acl', this.acl);
  form.append('policy', this.policy);
  form.append('signature', this.signature);
  form.append('Content-Type', this.type);
  form.append('Content-Length', this.file.length);
  form.append('file', this.file);

  xhr.open('POST', this.bucketUrl, true);
  xhr.send(form);
};

/**
 * Abort the XHR.
 *
 * @api public
 */

Upload.prototype.abort = function(){
  this.emit('abort');
  this.xhr.abort();
};

},{"emitter":47,"event":49}],49:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"dup":34}],50:[function(require,module,exports){
var css = ".uploader {\n  position: relative;\n  background-position: 50% 50%;\n  background-color: #f0f0f0;\n  background-size: cover;\n  font-family: sans-serif;\n  font-size: small;\n}\n.uploader,\n.uploader::before,\n.uploader input {\n  cursor: pointer;\n  overflow: hidden !important;\n  display: block !important;\n}\n.uploader input {\n  height: 100% !important;\n  width: 100% !important;\n  opacity: 0;\n  z-index: 1;\n}\n.uploader::before {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  width: 100%;\n  line-height: 100px;\n  text-align: center;\n  white-space: nowrap;\n  content: 'upload image';\n  color: #fff;\n  background: rgba(0,0,0,0.6);\n  opacity: 0;\n  transition: opacity 0.2s;\n}\n.uploader.drop::before,\n.uploader:focus::before,\n.uploader:hover::before {\n  opacity: 1;\n}\n.screenshot {\n  height: 180px;\n  width: 260px;\n}\n.avatar {\n  height: 100px;\n  width: 100px;\n}\n.screenshot::before,\n.avatar::before,\n.screenshot,\n.avatar {\n  border-radius: 5px;\n}\n"; (require("browserify-css").createStyle(css, { "href": "uploader.css"})); module.exports = css;
},{"browserify-css":3}]},{},[2])(2)
});