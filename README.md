
# avatar

![avatar gif](https://i.cloudup.com/XloypZKJ20.gif)

Profile image upload/display component.
Uses [component/s3](https://github.com/component/s3) for storage.

## Install

With [component](https://github.com/component/component):

```
$ component install lvivier/avatar
```

[component/s3](https://github.com/component/s3) also requires an `S3` 
global containing an S3 policy, see the s3 docs for help setting up.

## Usage

```js
var avatar = require('avatar')
var el = document.getElementById('myavatar')

avatar(el)
```

## API

### Avatar([el], [url])

Returns a new avatar with optional `el` and `url`.

### Avatar#set(url)

Sets the avatar image to `url`. Emits `change`.

### Avatar#appendTo(el)

Appends the avatar element to `el`.

### Events

- **ready** when avatar is initialized
- **upload** when a file is selected or dropped onto the avatar
- **change** when the avatar's image url changes

## License

(The MIT License)

Copyright (c) 2014 Luke Vivier <luke@vivier.ca>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
