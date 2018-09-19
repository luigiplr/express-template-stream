express-template-stream
============
[![NPM version](https://badge.fury.io/js/express-template-stream.svg)](http://badge.fury.io/js/express-template-stream)
[![Dependency Status](https://img.shields.io/david/luigiplr/express-template-stream.svg)](https://david-dm.org/luigiplr/express-template-stream)
[![npm](https://img.shields.io/npm/dm/express-template-stream.svg?maxAge=2592000)]()

Express middleware that allows streaming of template literals w/ interpolation of Node.JS streams, Arrays and Promises.

## Installation
```bash
$ npm install express-template-stream --save
```

## API

### `ETS.middleware([options])`

Creates a new Express Template Stream middleware instance.

#### Arguments

* [`options`] *(Object)* :
  * [`debug`] *(Boolean)*: Defaults to `false`. If `true` all requests will have an `x-ets-streamed` header added. Its value being a binary 1 or 0 depending on if the request was streamed or not. Also sets `this.debug` within StreamTemplate Instances.
  * [`minify`] *(Boolean)*: Defaults to `true`. Minify HTML
  * [`templates`] *(Object)*: Consisting of all the possible StreamTemplates that can be used.
  * [`headers`] *(Function|Object)*: Headers to be added to every request regardless of the StreamTemplate used. (Function must return an object)
  * [`match`] *(Function)*: Expects an object returned with the shape of `{ templateKey: string, templateData: any }` templateData can be accessed via `this.data` within StreamTemplates Instances.


#### Examples

##### Create a new middleware instance

```js
export default ETS.middleware({
  debug: process.env.NODE_ENV === 'development',
  minify: process.env.NODE_ENV === 'production',
  headers: (req, res) => {
    return {
      ...ETS.defaultHeaders,
      'x-server-hash': ...
    }
  },
  templates: {
    amp: // AMP specific render template
    normal: // render template
    bot: // bot specific render template
  },
  match: (req, res) => {
    return {
      templateKey: req.useragent.includes('bot') ? 'bot' : 'normal',
      templateData: {
        ...
      }
    }
  }
})
```
