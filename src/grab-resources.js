import cheerio from 'cheerio'
import { join } from 'path'
import { formatHtml, formatUrl, normalizeExtension } from './utils/index.js'
import { debug } from './lib/index.js'

export default function grabResources(html, rootUrl, path) {
    const SELECTORS = ['img', 'link', 'script']

    const SourceAttrBySelector = {
        img: 'src',
        link: 'href',
        script: 'src',
    }

    const $ = cheerio.load(html)
    const pageUrl = new URL(rootUrl)

    const resources = SELECTORS.flatMap((selector) =>
        $.root()
            .find(selector)
            .toArray()
            .map((el) => {
                const attrSource = SourceAttrBySelector[selector]
                const source = $(el).attr(attrSource)
                const resourceUrl = new URL(source, rootUrl)

                if (!source) return null
                if (resourceUrl.origin !== pageUrl.origin) return null

                const formattedPath = join(
                    path,
                    normalizeExtension(formatUrl(new URL(source, rootUrl).href), '.html')
                )
                $(el).attr(attrSource, formattedPath)

                return { href: resourceUrl.href, filePath: formattedPath }
            })
    ).filter((item) => item !== null)

    debug(`resources: ${JSON.stringify(resources, null, 2)}`)
    debug(`html: ${formatHtml($.html())}`)

    return { resources, html: formatHtml($.html()) }
}
