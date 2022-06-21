import { test, expect } from '@jest/globals'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'
import { mkdtemp, readFile as readFileBase, readdir } from 'fs/promises'
import { dirname, join } from 'path'
import _ from 'lodash'
import nock from 'nock'
import pageLoader from '../src/index.js'

let tempPath

const readFile = _.partialRight(readFileBase, 'utf-8')
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const getFixturePath = (filename) => join(__dirname, '..', '__fixtures__', filename)
const readFixture = (filename) => readFile(getFixturePath(filename))

beforeEach(async () => {
    tempPath = await mkdtemp(join(tmpdir(), 'page-loader-'))

    nock('https://ru.hexlet.io')
        .get('/courses')
        .times(2)
        .replyWithFile(200, getFixturePath('index.html'))
        .get('/assets/professions/nodejs.png')
        .replyWithFile(200, getFixturePath('picture.png'))
        .get('/packs/js/runtime.js')
        .replyWithFile(200, getFixturePath('script.js'))
        .get('/assets/application.css')
        .replyWithFile(200, getFixturePath('styles.css'))
        .get('/packs/js/not-found.js')
        .replyWithError('resource not found')
        .get('/not-found')
        .replyWithError('page not found')
})

test('page-loader: full path of the loaded file', async () => {
    const filePath = await pageLoader('https://ru.hexlet.io/courses', tempPath)

    expect(filePath).toBe(join(tempPath, 'ru-hexlet-io-courses.html'))
})

test('page-loader: write expected file', async () => {
    const expectedFile = await readFixture('expected-index.html')
    const filePath = await pageLoader('https://ru.hexlet.io/courses', tempPath)

    expect(await readFile(filePath)).toBe(expectedFile)
})

test('page-loader: write expected assets', async () => {
    await pageLoader('https://ru.hexlet.io/courses', tempPath)
    const assetsPath = join(tempPath, 'ru-hexlet-io-courses_files')
    const fileName = 'ru-hexlet-io-assets-professions-nodejs.png'

    expect(await readdir(assetsPath)).toHaveLength(4)
    expect(await readFile(join(assetsPath, fileName))).toBe(await readFixture('picture.png'))
})
