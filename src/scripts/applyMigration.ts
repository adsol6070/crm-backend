import { commonKnex } from "../config/database";

const applySpecificMigration = async (migrationName: string) => {
  try {
    const [completedMigrations, pendingMigrations] =
      await commonKnex.migrate.list();
    const migrationToApply = pendingMigrations.find(
      (mig: any) => mig.file === migrationName,
    );

    if (migrationToApply) {
      await commonKnex.migrate.up({ name: migrationName });
      console.log(`Migration ${migrationName} applied successfully.`);
    } else {
      console.log(
        `Migration ${migrationName} is not pending or already applied.`,
      );
    }
  } catch (error: any) {
    console.error(`Error applying migration: ${error.message}`);
  } finally {
    await commonKnex.destroy();
  }
};

const migrationName = process.argv[2];
if (!migrationName) {
  console.error("Please provide a migration name to apply.");
  process.exit(1);
}

applySpecificMigration(migrationName);
