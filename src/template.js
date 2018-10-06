import _ from 'lodash'
import stream from 'readable-stream'

import ST from 'stream-template'
import concatStream from 'concat-stream'
import { ReplaySubject } from 'rxjs'
import async from 'async'
import url from 'url'
import eos from 'end-of-stream'


export default class Template {
  constructor(req, res, opts) {
    this.headers$ = new ReplaySubject()
    this.html = new stream.PassThrough()
    this._streamHTML = false
    this._htmlStreamStarted = false

    this.data = opts.data
    this.debug = opts.debug
    this._req = req
    this._res = res

    if (_.isFunction(this.streamable) && this.streamable(req, res)) {
      this._streamHTML = true
    }
  }

  ST = ST

  async _init() {
    if (_.isFunction(this.init)) {
      await this.init.bind(this)()
    }

    this._setupHeaders()

    this.headers$.subscribe({
      complete: err => {
        if (err) {
          return this._onError(err)
        }

        this._startHTMLStream(this.htmlTag || '<html>')
      }
    })
  }

  body() {
    return (
      `
      <body>
        ETS DEFAULT BODY
      </body>
      `
    )
  }

  head() {
    return (
      `
      <head>
        <title>ETS DEFAULT TITLE</title>
      </head>
      `
    )
  }

  redirect(...args) {
    let [status, location] = args

    if (_.isString(status) && _.isNil(location)) {
      location = status
    }

    if (this._streamHTML && this._htmlStreamStarted) {
      this.html.write(`
        <script type="text/javascript">location.replace('${location}');</script>

        <noscript>
          <meta http-equiv="refresh" content="0;url=${location}" />
        </noscript>
      `)
    } else {
      this._res.redirect(...args)
    }

    this.html.end()
  }

  _setupHeaders() {
    const headers = this._headers()

    if ('headers' in this) {
      headers.push(...this.headers())
    }

    async.each(
      headers,
      async ([key, value], callback) => {
        try {
          if (_.isObject(value) && 'then' in value) {
            value = await value
          }
        } catch (err) {
          if (err) {
            return callback(err)
          }
        }

        this.headers$.next([key, value])
        callback()
      },
      err => this.headers$.complete(err)
    )
  }

  _onError(err) {
    if ('onError' in this && _.isFunction(this.onError)) {
      return this.onError(err, this._req, this._res)
    }

    this._res.end()
  }

  _headers() {
    if (this.debug) {
      return [
        ['x-ets-streamed', +this._streamHTML]
      ]
    }

    return []
  }

  _startHTMLStream = htmlTag => {
    this._renderStream = ST`
      <!DOCTYPE html>
      ${htmlTag}
        ${this.head()}
        ${this.body()}
      </html>
    `

    eos(
      htmlStream,
      err => err && this._onError(err)
    )

    if (this._streamHTML) {
      this._htmlStreamStarted = true
      return renderStream.pipe(this.html)
    }

    renderStream.pipe(
      concatStream(
        { encoding: 'string' },
        html => this.html.end(html)
      )
    )
  }
}
