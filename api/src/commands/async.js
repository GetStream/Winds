#!/usr/bin/env ./node_modules/.bin/babel-node

import "../loadenv"
import "../utils/db"
import program from "commander"

import { version } from "../../../app/package.json"

program
	.version(version)
	.command('run <queue>', 'Process queue(s)')
	.parse(process.argv)

function main() {
}

main()
