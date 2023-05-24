#!/usr/bin/env node
const client = require('../src/utils/client');
const yargs = require('yargs');
const colors = require('colors');
const { hideBin } = require('yargs/helpers');

const {
    up, 
    down,
    create,
} = require('../src/commands');

yargs(hideBin(process.argv))
  .command(
    'create <name>',
    'Create a new migration',
    (yargs) => {
      yargs.positional('name', {
        describe: 'Name of the migration',
        type: 'string',
      });
    },
    (argv) => {
      create(argv.name);
      console.log(colors.green('Migration file created successfully'));
    }
  )
  .command(
    'up [until]',
    'Run all migrations that have not yet been applied',
    (yargs) => {
      yargs.positional('until', {
        describe: 'Apply migrations up to this one',
        type: 'string',
      });
    },
    async (argv) => {
      try {
        await up(client, argv.until);
        console.log(colors.green('Migrations applied successfully'));
      } catch (err) {
        console.error(colors.red(err));
      }
    }
  )
  .command(
    'down [until]',
    'Undo migrations up to a specific point',
    (yargs) => {
      yargs.positional('until', {
        describe: 'Reverse migrations up to this one',
        type: 'string',
      });
    },
    async (argv) => {
      try {
        await down(client, argv.until);
        console.log(colors.green('Migrations reversed successfully'));
      } catch (err) {
        console.error(colors.red(err));
      }
    }
  )
  .help()
  .argv;
