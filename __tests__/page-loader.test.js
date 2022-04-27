import { test, expect } from '@jest/globals'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'
import { mkdtemp, readFile } from 'fs/promises'
import { dirname, join } from 'path'
import nock from 'nock'
import pageLoader from '../src/init.js'

let tempPath
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const getFixturePath = (filename) => join(__dirname, '..', '__fixtures__', filename)
const readFixture = (filename) => readFile(getFixturePath(filename), 'utf-8')

beforeEach(async () => {
    tempPath = await mkdtemp(join(tmpdir(), 'page-loader-'))

    const expectedFile = await readFixture('expected-file.html')
    nock('https://ru.hexlet.io').get('/courses').reply(200, expectedFile)
})

test('page-loader: full path of the loaded file', async () => {
    const filePath = await pageLoader('https://ru.hexlet.io/courses', tempPath)

    expect(filePath).toBe(join(tempPath, 'ru-hexlet-io-courses.html'))
})

test('page-loader: write expected file', async () => {
    const expectedFile = await readFixture('expected-file.html')
    const filePath = await pageLoader('https://ru.hexlet.io/courses', tempPath)
    const loadedFile = await readFile(filePath, 'utf-8')

    expect(loadedFile).toBe(expectedFile)
})
