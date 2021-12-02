#!/usr/bin/env node
import { Command } from 'commander'
import init from '../index.js'

const program = new Command()
program
    .version('1.0.0')
    .description('Page loader utility.')
    .arguments('<url>')
    .option('-o, --output [dir]', 'output dir (default: "/home/user/current-dir")', process.cwd())
    .action((url) => {
        const { output } = program.opts()
        init(url, output)
    })

program.parse(process.argv)
