
# uploader

![avatar gif](https://i.cloudup.com/XloypZKJ20.gif)

Image upload/display component.
Uses [component/s3](https://github.com/component/s3) for storage.

## Install

With [component](https://github.com/component/component):

```
$ component install lvivier/uploader
```

[component/s3](https://github.com/component/s3) also requires an `S3` 
global containing an S3 policy, see the s3 docs for help setting up.

## Usage

```js
var upload = require('uploader')
var el = document.getElementById('avatar')

upload(el)
```

## API

### Uploader([el], [opts])

Returns a new uploader with optional `el`, `opts.name`, and `opts.url`.

### Uploader#set(url)

Sets the image to `url`. Emits `change`.

### Uploader#appendTo(el)

Appends the view element to `el`.

### Events

- **ready** when uploader is initialized
- **upload** when a file is selected or dropped onto the uploader
- **complete** when the file is completely uploaded
- **change** when the uploader's image url changes

## License

(The MIT License)

Copyright (c) 2014 Luke Vivier <luke@vivier.ca>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
