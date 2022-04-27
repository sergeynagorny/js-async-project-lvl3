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
        loadPage(url, output).then((res) => console.log(res))
    })

program.parse(process.argv)
