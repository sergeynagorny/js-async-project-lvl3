import { test } from '@jest/globals'
import fs from 'fs/promises'
import os from 'os'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import nock from 'nock'
import _ from 'lodash'
import loadPage from '../src/load-page.js'
import { formatHtml } from '../src/utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const tmpdir = os.tmpdir()
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename)
const getTmpPath = (filename) => path.join(tmpdir, filename)

const readFixturesFile = async (filename) => await fs.readFile(getFixturePath(filename), 'utf-8')
const readTmpFile = async (filename) => await fs.readFile(getTmpPath(filename), 'utf-8')

const resultHtmlFileName = 'ru-hexlet-io-courses.html'
const resultFilesDirName = 'ru-hexlet-io-courses_files'

beforeAll(async () => {
    await fs.rmdir(getTmpPath(resultFilesDirName), { recursive: true }).catch(_.noop)
    const html = await readFixturesFile('before.html')
    const img = await readFixturesFile('img/nodejs.png')

    nock.disableNetConnect()
    nock('https://ru.hexlet.io').get('/courses').reply(200, html)
    nock('https://ru.hexlet.io').get('/assets/professions/nodejs.png').reply(200, img)
    nock('https://ru.hexlet.io')
        .get(/\.(html|css|js)/)
        .reply(200, '')
    nock('https://ru.hexlet.io').get('/courses.html').reply(200, '')
    nock('https://ru.hexlet.io').get('/packs/js/runtime.js').reply(200, '')
})

test('load page', async () => {
    const { filePath } = await loadPage('https://ru.hexlet.io/courses', tmpdir)
    const resultHtml = await readTmpFile(resultHtmlFileName)
    const expectedHtml = await readFixturesFile('after.html').then(formatHtml)
    const expectedImgFile = await readFixturesFile('img/nodejs.png')
    const resultImgFile = await readTmpFile(
        `${resultFilesDirName}/ru-hexlet-io-assets-professions-nodejs.png`
    )

    expect(filePath).toEqual(getTmpPath(resultHtmlFileName))
    expect(expectedHtml).toEqual(resultHtml)
    expect(expectedImgFile).toEqual(resultImgFile)
})
