#!/usr/bin/env node
const createClient = require('../src/utils/client');
const yargs = require('yargs');
const colors = require('colors');
const { hideBin } = require('yargs/helpers');

const {
    up, 
    down,
    make,
    latest,
} = require('../src/commands');

yargs(hideBin(process.argv))
  .command(
    'migrate:make <name>',
    'Create a new migration',
    (yargs) => {
      yargs.positional('name', {
        describe: 'Name of the migration',
        type: 'string',
      });
    },
    (argv) => {
      make(argv.name);
      console.log(colors.green('Migration file created successfully'));
    }
  )
  .command(
    'migrate:up [until]',
    'Run all migrations that have not yet been applied',
    (yargs) => {
      yargs.positional('until', {
        describe: 'Apply migrations up to this one',
        type: 'string',
      });
    },
    async (argv) => {
      try {
        const client = await createClient()
        const {message} = await up(client, argv.until);
        console.log(colors.green(message));
      } catch (err) {
        console.error(colors.red(err));
      }
    }
  )
  .command(
    'migrate:down [until]',
    'Undo migrations up to a specific point',
    (yargs) => {
      yargs.positional('until', {
        describe: 'Reverse migrations up to this one',
        type: 'string',
      });
    },
    async (argv) => {
      try {
        const client = await createClient()
        const {message} = await down(client, argv.until);
        console.log(colors.green(message));
      } catch (err) {
        console.error(colors.red(err));
      }
    }
  )
  .command(
    'migrate:latest',
    'Migrate all migrations not yet applied',
    async () => {
      try {
        const client = await createClient()
        const {message} = await latest(client);
        console.log(colors.green(message));
      } catch (err) {
        console.error(colors.red(err));
      }
    }
  )
  .help()
  .argv;
