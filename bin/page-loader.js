#!/usr/bin/env node
import { Command } from 'commander'
import loadPage from '../index.js'

const program = new Command()
program
    .version('1.0.0')
    .description('Page loader utility.')
    .arguments('<url>')
    .option('-o, --output [dir]', 'output dir', process.cwd())
    .action((url) => {
        const { output } = program.opts()

        loadPage(url, output)
            .then((res) => {
                console.log(`Page was successfully downloaded into: ${res}`)
                process.exit(0)
            })
            .catch((e) => {
                console.error(e)
                process.exit(1)
            })
    })

program.parse(process.argv)
