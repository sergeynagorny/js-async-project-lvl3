import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import Listr from 'listr'
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
        .then(async ({ data }) => {
            const { resources, html } = grabResources(data, requestUrl, loadedAssetsDirPath)

            const tasks = new Listr(
                resources.map(({ href, filePath }) => ({
                    title: href,
                    task: () =>
                        http
                            .get(href, { responseType: 'arraybuffer' })
                            .then(({ data: file }) => writeFile(join(outputPath, filePath), file))
                            .catch(() => console.error(`Can't download: ${href}`)),
                })),
                { concurrent: true }
            )

            return mkdir(outputPath, { recursive: true })
                .then(() => writeFile(fullPath, html))
                .then(() => mkdir(join(outputPath, loadedAssetsDirPath), { recursive: true }))
                .then(() => tasks.run())
        })
        .then(() => {
            debug(`output: ${fullPath}`)
            return fullPath
        })
        .catch((e) => console.error(e.message))
}
