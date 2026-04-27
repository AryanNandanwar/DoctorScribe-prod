const { TableForeignKey } = require("typeorm");

module.exports = class FixPatientIdForeignKey1747664560001 {
    async up(queryRunner) {
        // First, drop the existing foreign key constraint
        await queryRunner.query(`
            ALTER TABLE clinical_notes 
            DROP CONSTRAINT IF EXISTS clinical_notes_patient_id_fkey
        `);

        // Add the foreign key back with proper null handling
        await queryRunner.createForeignKey("clinical_notes", new TableForeignKey({
            columnNames: ["patient_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "patient",
            onDelete: "SET NULL", // Allow null when patient is deleted
            onUpdate: "CASCADE",
            deferrable: "INITIALLY DEFERRED" // Allow constraint checking at transaction end
        }));
    }

    async down(queryRunner) {
        // Drop the modified foreign key
        await queryRunner.query(`
            ALTER TABLE clinical_notes 
            DROP CONSTRAINT IF EXISTS clinical_notes_patient_id_fkey
        `);

        // Recreate the original restrictive foreign key
        await queryRunner.createForeignKey("clinical_notes", new TableForeignKey({
            columnNames: ["patient_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "patient",
            onDelete: "CASCADE",
            onUpdate: "CASCADE"
        }));
    }
};
