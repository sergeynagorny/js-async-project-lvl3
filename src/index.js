import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import cheerio from 'cheerio'
import axios from 'axios'
import prettier from 'prettier'

// TODO: Utils
const formatHtml = (html) => prettier.format(html, { parser: 'html' })

const formatUrl = (url) => {
    const Reg = {
        protocol: new RegExp(/^https?:\/\//),
        characters: new RegExp(`([/]|[.](?![a-z0-9]+$))`, 'g'),
    }

    const removeProtocol = (str) => str.replace(Reg.protocol, '')
    const replaceCharacter = (str) => str.replace(Reg.characters, '-')

    return replaceCharacter(removeProtocol(url))
}

const normalizeExtension = (str, ext) => {
    const EXT = 'html|png|jpg|css|js'
    const extRegExp = RegExp(`[.-](${EXT})$`)
    return str.match(extRegExp) ? str : str + ext
}

const grabResources = (html, rootUrl, path) => {
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

    return { resources, html: formatHtml($.html()) }
}

export default function loadPage(requestUrl, outputPath) {
    const loadedFilePath = formatUrl(requestUrl)
    const loadedAssetsDirPath = `${loadedFilePath}_files`
    const fullPath = join(outputPath, normalizeExtension(loadedFilePath, '.html'))

    return axios
        .get(requestUrl)
        .then(({ data }) => {
            const { resources, html } = grabResources(data, requestUrl, loadedAssetsDirPath)

            const downloadResources = () =>
                Promise.all(
                    resources.map(({ href, filePath }) =>
                        axios
                            .get(href, { responseType: 'arraybuffer' })
                            .then(({ data: file }) => writeFile(join(outputPath, filePath), file))
                            .catch((error) => console.error(`${error.name}: ${error.message}`))
                    )
                )

            return writeFile(fullPath, html)
                .then(() => mkdir(join(outputPath, loadedAssetsDirPath), { recursive: true }))
                .then(downloadResources)
        })
        .then(() => fullPath)
}
