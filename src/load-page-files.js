import cheerio from 'cheerio'
import path from 'path'
import axios from 'axios'
import fs from 'fs/promises'
import _ from 'lodash'
import createName from './create-name.js'

const getFilePromise = (href, filePath) =>
    axios
        .get(href, { responseType: 'arraybuffer' })
        .then(({ data }) => fs.writeFile(filePath, data))

export default function loadPageFiles({ html, requestUrl, outputPath }) {
    const $ = cheerio.load(html)
    const filesDirRelativePath = createName(requestUrl, '_files')
    const filesDirAbsolutePath = path.join(outputPath, filesDirRelativePath)
    const promises = []

    $.root()
        .find('img')
        .each((i, element) => {
            const elementSrc = $(element).attr('src')
            const { href: fileHref } = new URL(elementSrc, requestUrl)
            const fileRelativePath = path.join(filesDirRelativePath, createName(fileHref))
            const fileAbsolutePath = path.join(outputPath, fileRelativePath)

            promises.push(getFilePromise(fileHref, fileAbsolutePath))

            $(element).attr('src', fileRelativePath)
        })

    return fs
        .mkdir(filesDirAbsolutePath)
        .catch(_.noop) // suppress an error if the directory has already been created
        .then(() => Promise.all(promises))
        .then(() => ({ html: $.html() }))
}
