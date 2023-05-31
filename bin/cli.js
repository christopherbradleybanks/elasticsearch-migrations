#!/usr/bin/env node
const ElasticMigrations = require('../src');
const yargs = require('yargs');
const colors = require('colors');
const { hideBin } = require('yargs/helpers');
const {migrate, seed} = new ElasticMigrations()

yargs(hideBin(process.argv))
  .command(
    'migrate:make <name>',
    'Create a new migration',
   async (yargs) => {
      yargs.positional('name', {
        describe: 'Name of the migration',
        type: 'string',
      });
    },
   async (argv) => {
     await migrate.make(argv.name);
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
        const {message} = await migrate.up(argv.until);
        console.log(colors.green(message));
      } catch (err) {
        console.error(colors.red(err));
      }
    }
  )
  .command(
    'migrate:rollback',
    `Revert latest migrations`,
    (yargs) => {
      yargs.option('all', {
        alias: `a`,
        description: 'rollback all migrations',
        type: 'boolean',
      });
    },
    async (argv) => {
      try {
        const {message} = await migrate.rollback(argv.all);
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
        const {message} = await migrate.down(argv.until);
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
        const {message} = await migrate.latest();
        console.log(colors.green(message));
      } catch (err) {
        console.error(colors.red(err));
      }
    }
  )
  .command(
    'migrate:destroy',
    'Delete the index and all migration history',
    async () => {
      try {
        await migrate.destroy();
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
    async (argv) => {
      await seed.make(argv.name);
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
        const {message} = await seed.run(argv.file);
        console.log(colors.green(message));
      } catch (err) {
        console.error(colors.red(err));
      }
    }
  )
  .command(
    'seed:destroy',
    'Delete the index and all seed history',
    async () => {
      try {
        await seed.destroy();
      } catch (err) {
        console.error(colors.red(err));
      }
    }
  )
  .help()
  .argv;
