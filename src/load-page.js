import fs from 'fs/promises'
import axios from 'axios'
import path from 'path'
import createName from './create-name.js'
import { formatHtml } from './utils.js'
import loadPageFiles from './load-page-files.js'

export default function loadPage(requestUrl, outputPath) {
    const filePath = path.join(outputPath, createName(requestUrl, '.html'))

    return axios
        .get(requestUrl)
        .then(({ data }) => loadPageFiles({ html: data, requestUrl, outputPath }))
        .then(({ html }) => fs.writeFile(filePath, formatHtml(html), 'utf-8'))
        .then(() => ({ filePath }))
}
