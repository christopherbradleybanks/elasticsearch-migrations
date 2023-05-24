# Elasticsearch Migrations

Elasticsearch Migrations is a package for managing Elasticsearch migrations, similar to how you would manage a traditional SQL database schema migration. It provides a command-line interface for creating and running migrations, and can also be used programmatically in your code.

## Prerequisites

- Node.js
- Elasticsearch 8.7

## Installation

To install the package, run:

```bash
npm install elasticsearch-migrations
```

## Usage

### Command-Line Interface

#### Creating a Migration

To create a new migration file, use the `create` command:

```bash
npx elastic-migrate create [name]
```

This will create a new migration file in the `migrations` directory with the provided name.

#### Running Migrations

To run all migrations up to the most recent, use the `up` command:

```bash
npx elastic-migrate up
```

To run all migrations up to a specific one, use the `up` command with the `--until` option:

```bash
npx elastic-migrate up --until [name]
```

#### Rolling Back Migrations

To roll back all migrations, use the `down` command:

```bash
npx elastic-migrate down
```

To roll back all migrations down to a specific one, use the `down` command with the `--until` option:

```bash
npx elastic-migrate down --until [name]
```

### Programmatic Usage

Elasticsearch Migrations can also be used in your code. First, import the `up` and `down` functions from the package:

```javascript
const { up, down } = require('elasticsearch-migrations');
```

Then, you can use these functions to run or roll back migrations. Note that you need to pass your Elasticsearch client as the first argument:

```javascript
const client = new Client({
  // Your client options here...
});

up(client, '20230524_add_new_field.js');
down(client, '20230524_add_new_field.js');
```

## Configuration

The package uses environment variables for configuration. These can be set in a `.env` file in your project root.
- `MIGRATIONS_DIR`: The directory where your migration files are located. Default is `./migrations`.
- `NODE_ENV`: The current environment. Use `development` for local development and `production` for production. Default is `development`.
- `LOCAL_ELASTICSEARCH_URL`: The URL of your local Elasticsearch instance.
- `PROD_ELASTICSEARCH_URL`: The URL of your production Elasticsearch instance.
- `LOCAL_ELASTICSEARCH_AUTH`: The authentication strategy and credentials for your local Elasticsearch instance. See [Authentication Strategies](#authentication-strategies) for more information.
- `PROD_ELASTICSEARCH_AUTH`: The authentication strategy and credentials for your production Elasticsearch instance. See [Authentication Strategies](#authentication-strategies) for more information.
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
