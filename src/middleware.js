import _ from 'lodash'
import { Minifier } from 'minify-html-stream'

const defaultHeaders = {
  'Content-Type': 'text/html'
}

export default function middleware({ templates, match, headers = defaultHeaders, minify = true }) {
  return (req, res, next) => {
    const templateKey = match(req, res)

    if (_.isNil(templateKey)) {
      return next()
    }

    if (!(templateKey in templates)) {
      console.warn(`[ETS] Template key ${templateKey} not present within provided templates!`)
      return next()
    }

    for (let key in defaultHeaders) {
      res.header(key, defaultHeaders[key])
    }

    const Template = new templates[templateKey](req, res)

    renderTemplate.headers$.subscribe(([key, value]) => {
      res.header(key, value)
    })

    let html = renderTemplate.html

    if (minify) {
      html = html.pipe(new Minifier())
    }

    html.pipe(res)
  }
}