import cheerio from 'cheerio'
import path from 'path'
import axios from 'axios'
import fs from 'fs/promises'
import _ from 'lodash'
import createName from './create-name.js'

const SourceAttrBySelector = {
    script: 'src',
    link: 'href',
    img: 'src',
}

const getFilePromise = (href, filePath) =>
    axios
        .get(href, { responseType: 'arraybuffer' })
        .then(({ data }) => fs.writeFile(filePath, data))

export default function loadPageFiles({ html, requestUrl, outputPath }) {
    const $ = cheerio.load(html)
    const pageUrl = new URL(requestUrl)
    const filesDirRelativePath = createName(pageUrl, '_files')
    const filesDirAbsolutePath = path.join(outputPath, filesDirRelativePath)
    const promises = []

    const SELECTORS = ['img', 'link', 'script']

    SELECTORS.forEach((selector) => {
        $.root()
            .find(selector)
            .each((i, element) => {
                const attr = SourceAttrBySelector[selector]
                let elementSrc = $(element).attr(attr)

                if (selector === 'link' && $(element).attr('rel') !== 'stylesheet') {
                    elementSrc += '.html'
                }

                const fileUrl = new URL(elementSrc, requestUrl)

                if (fileUrl.origin !== pageUrl.origin) {
                    return
                }

                const fileRelativePath = path.join(filesDirRelativePath, createName(fileUrl.href))
                const fileAbsolutePath = path.join(outputPath, fileRelativePath)

                promises.push(getFilePromise(fileUrl.href, fileAbsolutePath))

                $(element).attr(attr, fileRelativePath)
            })
    })

    return fs
        .mkdir(filesDirAbsolutePath)
        .catch(_.noop) // suppress an error if the directory has already been created
        .then(() => Promise.all(promises))
        .catch(_.noop) // suppress an error if the file has 404 status
        .then(() => ({ html: $.html() }))
}
