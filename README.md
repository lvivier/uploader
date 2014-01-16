
# avatar

![avatar gif](https://i.cloudup.com/XloypZKJ20.gif)

Profile image upload/display component.
Uses [component/s3](https://github.com/component/s3) for storage.

## Install

With [component](https://github.com/component/component):

```
$ component install lvivier/avatar
```

## Usage

```js
var avatar = require('avatar')
var el = document.getElementById('myavatar')

avatar(el)
```

## API

TODO

### Avatar(el[, opts])
### Avatar#set(url)
### Event: 'ready'
### Event: 'upload'
### Event: 'change'