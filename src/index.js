import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { debug, http } from './lib/index.js'
import { formatUrl, normalizeExtension } from './utils/index.js'
import grabResources from './grab-resources.js'

export default function loadPage(requestUrl, outputPath) {
    debug(`incoming: url: ${requestUrl}, path: ${outputPath}`)

    const loadedFilePath = formatUrl(requestUrl)
    const loadedAssetsDirPath = `${loadedFilePath}_files`
    const fullPath = join(outputPath, normalizeExtension(loadedFilePath, '.html'))

    return http
        .get(requestUrl)
        .then(({ data }) => {
            const { resources, html } = grabResources(data, requestUrl, loadedAssetsDirPath)

            const downloadResources = () =>
                Promise.all(
                    resources.map(({ href, filePath }) =>
                        http
                            .get(href, { responseType: 'arraybuffer' })
                            .then(({ data: file }) => writeFile(join(outputPath, filePath), file))
                            .catch((error) => console.error(`${error.name}: ${error.message}`))
                    )
                )

            return writeFile(fullPath, html)
                .then(() => mkdir(join(outputPath, loadedAssetsDirPath), { recursive: true }))
                .then(downloadResources)
        })
        .then(() => {
            debug(`output: ${fullPath}`)
            return fullPath
        })
}
