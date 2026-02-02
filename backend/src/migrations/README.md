# Sequelize Migrations

This directory contains Sequelize database migrations.

## Creating a New Migration

Use the migration creation script:

```bash
npm run migrate:create <migration-name>
```

Example:
```bash
npm run migrate:create add-venues-table
```

This will create a new migration file in the format: `YYYYMMDDHHMMSS-<migration-name>.js`

## Running Migrations

### Run all pending migrations:
```bash
npm run migrate
```

### Rollback last migration:
```bash
npm run migrate:undo
```

### Rollback all migrations:
```bash
npm run migrate:undo:all
```

## Migration File Structure

Each migration file exports `up` and `down` methods:

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Migration code here
  },

  async down(queryInterface, Sequelize) {
    // Rollback code here
  },
};
```

## Example Migration

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('venues', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('venues');
  },
};
```

## Sequelize QueryInterface Methods

Common methods available:
- `createTable(tableName, attributes, options)`
- `dropTable(tableName, options)`
- `addColumn(tableName, attributeName, dataTypeOrOptions)`
- `removeColumn(tableName, attributeName)`
- `changeColumn(tableName, attributeName, dataTypeOrOptions)`
- `addIndex(tableName, attributes, options)`
- `removeIndex(tableName, indexName)`
- `bulkInsert(tableName, records, options)`
- `bulkDelete(tableName, where, options)`

For more details, see [Sequelize Migration Documentation](https://sequelize.org/docs/v6/other-topics/migrations/).
