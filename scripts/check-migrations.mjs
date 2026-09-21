import {
  existsSync,
  readdirSync,
  statSync,
} from "node:fs";

import {
  join,
} from "node:path";

/**
 * Migration safety check
 * ----------------------
 *
 * This script does NOT modify the database.
 *
 * It performs simple repository checks so deployment doesn't
 * accidentally depend only on schema.prisma.
 *
 * Production databases must be reproducible from committed
 * Prisma migration files.
 */

const migrationsDirectory =
  join(
    process.cwd(),
    "prisma",
    "migrations",
  );

if (!existsSync(migrationsDirectory)) {
  console.error(
    "❌ prisma/migrations does not exist.",
  );

  process.exit(1);
}

const migrationDirectories =
  readdirSync(migrationsDirectory)
    .filter((name) => {
      const path =
        join(
          migrationsDirectory,
          name,
        );

      return statSync(path).isDirectory();
    })
    .sort();

if (migrationDirectories.length === 0) {
  console.error(
    "❌ No Prisma migrations were found.",
  );

  process.exit(1);
}

let invalidMigration = false;

for (const migration of migrationDirectories) {
  const migrationSql =
    join(
      migrationsDirectory,
      migration,
      "migration.sql",
    );

  if (!existsSync(migrationSql)) {
    console.error(
      `❌ Missing migration.sql: ${migration}`,
    );

    invalidMigration = true;
  }
}

if (invalidMigration) {
  process.exit(1);
}

console.log(
  `✅ ${migrationDirectories.length} Prisma migration(s) checked.`,
);

console.log(
  "✅ Every migration directory contains migration.sql.",
);

console.log(
  "ℹ️ This check does not apply or modify migrations.",
);