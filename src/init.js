import { writeFile } from 'fs/promises'
import { join } from 'path'
import axios from 'axios'

const removeHttp = (str) => str.replace(/^https?:\/\//, '')
const formatUrl = (str) => str.replace(/[^A-Za-z0-9]/g, '-')

export default function loadPage(requestUrl, outputPath) {
    const loadedFilePath = formatUrl(removeHttp(requestUrl))
    const fullPath = join(outputPath, `${loadedFilePath}.html`)

    return axios
        .get(requestUrl)
        .then(({ data }) => writeFile(fullPath, data))
        .then(() => fullPath)
}
