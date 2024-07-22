import { commonKnex } from "../config/database";

const rollbackMigration = async (migrationName: string) => {
  try {
    const [completedMigrations] = await commonKnex.migrate.list();
    const migrationToRollback = completedMigrations.find(
      (mig: any) => mig.name === migrationName,
    );

    if (migrationToRollback) {
      await commonKnex.migrate.down({ name: migrationName });
      console.log(`Migration ${migrationName} rolled back successfully.`);
    } else {
      console.log(
        `Migration ${migrationName} has not been applied or already rolled back.`,
      );
    }
  } catch (error: any) {
    console.error(`Error rolling back migration: ${error.message}`);
  } finally {
    await commonKnex.destroy();
  }
};

const migrationName = process.argv[2];
if (!migrationName) {
  console.error("Please provide a migration name to rollback.");
  process.exit(1);
}

rollbackMigration(migrationName);
