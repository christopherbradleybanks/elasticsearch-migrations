# Elasticsearch Migrations

Elasticsearch Migrations is a package for managing Elasticsearch migrations, similar to how you would manage a traditional SQL database schema migration. It provides a command-line interface for creating and running migrations, and can also be used programmatically in your code.

## Prerequisites

- Node.js
- Elasticsearch 8.7

## Installation

To install the package, run:

```bash
npm install -g elasticsearch-migrations
```

## Usage

### Elastic Migrate CLI

Elastic Migrate provides a set of command-line utilities to help manage Elasticsearch migrations. These utilities are available through the `elastic-migrate` command.


### Commands

#### Migration

- `migrate:make <name>`: Create a new migration. Replace `<name>` with the desired name for your migration.

    Example usage:
    ```bash
    elastic-migrate migrate:make create_users_index
    ```
    On successful execution, it will output: "Migration file created successfully"

- `migrate:up [until]`: Run all migrations that have not yet been applied. If the optional `[until]` argument is provided, the migrations will be applied up to (and including) the specified migration.

    Example usage:
    ```bash
    elastic-migrate migrate:up
    ```
    or with the `[until]` option:
    ```bash
    elastic-migrate migrate:up create_users_index
    ```
    
- `migrate:down [until]`: Undo migrations up to a specific point. If the optional `[until]` argument is provided, migrations will be reversed up to (but not including) the specified migration.

    Example usage:
    ```bash
    elastic-migrate migrate:down
    ```
    or with the `[until]` option:
    ```bash
    elastic-migrate migrate:down create_users_index
    ```

- `migrate:latest`: Migrate all migrations not yet applied.

    Example usage:
    ```bash
    elastic-migrate migrate:latest
    ```
    
- `migrate:rollback --all`: Revert the latest batch of migrations. If the optional `--all` argument is provided all completed migrations will be reversed.

    Example usage:
    ```bash
    elastic-migrate migrate:rollback
    ```
    or with the `--all` option:
    ```bash
    elastic-migrate migrate:rollback --all
    ```

This command reverts migrations that have previously been applied. Without any options, it will revert the last batch of migrations that were applied. If the `[all]` option is set to true, it will reverse all migrations that have been applied, effectively rolling back all changes made by this tool.

- `migrate:destroy`: Deletes the migration history index

    Example usage:
    ```bash
    elastic-migrate migrate:destroy
    ```

This command will remove the history index but will not undo any migrations 
#### Seeds 

- `seed:make <name>`: Create a new seed file. Replace `<name>` with the desired name for your seed file. 

    Example usage:
    ```bash
    elastic-migrate seed:make seed_users_index
    ```

- `seed:run [file]`: Run all seed files that have not yet been applied. If the optional `[file]` argument is provided, only the specified seed file will be applied. 

    Example usage:
    ```bash
    elastic-migrate seed:run
    ```
    or with the `[file]` option:
    ```bash
    elastic-migrate seed:run seed_users_index
    ```
- `seed:destroy`: Deletes the seed history index

    Example usage:
    ```bash
    elastic-migrate seed:destroy
    ```

This command will remove the history index but will not undo any seeds 
Run `elastic-migrate --help` to see the list of available commands.

### Programmatic Usage

Elasticsearch Migrations can also be used in your code. First, import the `migrate` and `seed` libraries from the package:

```javascript
const ElasticMigrations = require('elasticsearch-migrations');
const { migrate, seed } = new ElasticMigrations(config)
```

```javascript
//Migrations
await migrate.make(`create_users_index`)
await migrate.up('20230524_create_users_index.js');
await migrate.down();
await migrate.latest()
await migrate.rollback()
await migrate.rollback(true)
await migrate.destroy()

//Seeds
await seed.make(`insert_users`)
await seed.run()
await seed.run(`2023044_insert_users.js`)
await seed.destroy()

//

```

## Configuration

The package uses environment variables for configuration. These can be set in a `.env` file in your project root.
- `SEEDS_DIR`: The directory where your migration files are located. Default is `./seeds`.
- `MIGRATIONS_DIR`: The directory where your migration files are located. Default is `./migrations`.
- `NODE_ENV`: The current environment. Use `development` for local development and `production` for production. Default is `development`.
- `LOCAL_ELASTICSEARCH_URL`: The URL of your local Elasticsearch instance.
- `PROD_ELASTICSEARCH_URL`: The URL of your production Elasticsearch instance.
- `LOCAL_ELASTICSEARCH_AUTH`: The authentication strategy and credentials for your local Elasticsearch instance. See [Authentication Strategies](#authentication-strategies) for more information.
- `PROD_ELASTICSEARCH_AUTH`: The authentication strategy and credentials for your production Elasticsearch instance. See [Authentication Strategies](#authentication-strategies) for more information.
- `CLOUD_ID`: The cloud id for your elastic cloud deployment
- `LOCAL_TLS_CA_CERT`: The path to your local CA certificate file.
- `PROD_TLS_CA_CERT`: The path to your production CA certificate file.
- `LOCAL_CA_FINGERPRINT`: The CA fingerprint for your local Elasticsearch instance.
- `PROD_CA_FINGERPRINT`: The CA fingerprint for your production Elasticsearch instance.

### Authentication Strategies

The `LOCAL_ELASTICSEARCH_AUTH` and `PROD_ELASTICSEARCH_AUTH` variables define the authentication strategy and credentials for Elasticsearch. These should be in the format `strategy:credentials`.

- For basic authentication, use `basic:username:password`. For example: `basic:elastic:changeme`
- For API key authentication, use `apiKey:key`. For example: `apiKey:base64EncodedKey`
- For bearer token authentication, use `bearer:token`. For example: `bearer:token`

## License

This project is licensed under the MIT
