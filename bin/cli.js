#!/usr/bin/env node
const Client = require('../src/utils/client');
const yargs = require('yargs');
const colors = require('colors');
const { hideBin } = require('yargs/helpers');

const {
    migrate,
    seed,
} = require('../src');

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
      migrate.make(argv.name);
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
        const {client} = new Client()
        const {message} = await migrate.up(client, argv.until);
        console.log(colors.green(message));
      } catch (err) {
        console.error(colors.red(err));
      }
    }
  )
  .command(
    'migrate:rollback [all]',
    `Revert latest migrations`,
    (yargs) => {
      yargs.positional('all', {
        describe: 'rollback all migrations',
        type: 'boolean',
      });
    },
    async (argv) => {
      try {
        const {client} = new Client()
        const {message} = await migrate.rollback(client, argv.all);
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
        const {client} = new Client()
        const {message} = await migrate.down(client, argv.until);
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
        const {client} = new Client()
        const {message} = await migrate.latest(client);
        console.log(colors.green(message));
      } catch (err) {
        console.error(colors.red(err));
      }
    }
  )
  .command(
    'seed:make <name>',
    'Create a new seed file',
    (yargs) => {
      yargs.positional('name', {
        describe: 'Name of the seed',
        type: 'string',
      });
    },
    (argv) => {
      seed.make(argv.name);
      console.log(colors.green('Seed file created successfully'));
    }
  )
  .command(
    'seed:run [file]',
    'Run all seed files that have not yet been applied',
    (yargs) => {
      yargs.positional('file', {
        describe: 'Apply specified seed file',
        type: 'string',
      });
    },
    async (argv) => {
      try {
        const {client} =  new Client()
        const {message} = await seed.run(client, argv.file);
        console.log(colors.green(message));
      } catch (err) {
        console.error(colors.red(err));
      }
    }
  )
  .help()
  .argv;
