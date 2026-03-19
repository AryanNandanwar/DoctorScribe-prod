const { TableColumn } = require("typeorm");

module.exports = class AddClinicalNotesFields1747664560000 {
    async up(queryRunner) {
        await queryRunner.addColumns('clinical_notes', [
            new TableColumn({
                name: 'findings',
                type: 'text',
                isNullable: true,
            }),
            new TableColumn({
                name: 'diagnosis', 
                type: 'text',
                isNullable: true,
            }),
            new TableColumn({
                name: 'investigations_advised',
                type: 'text',
                isNullable: true,
            })
        ]);

        // Add indexes for the new columns to help with searches
        await queryRunner.query(`CREATE INDEX "IDX_clinical_notes_findings" ON "clinical_notes" ("findings")`);
        await queryRunner.query(`CREATE INDEX "IDX_clinical_notes_diagnosis" ON "clinical_notes" ("diagnosis")`);
        await queryRunner.query(`CREATE INDEX "IDX_clinical_notes_investigations_advised" ON "clinical_notes" ("investigations_advised")`);
    }

    async down(queryRunner) {
        // Drop indexes first
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_clinical_notes_findings"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_clinical_notes_diagnosis"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_clinical_notes_investigations_advised"`);

        // Drop columns
        await queryRunner.dropColumn('clinical_notes', 'findings');
        await queryRunner.dropColumn('clinical_notes', 'diagnosis');
        await queryRunner.dropColumn('clinical_notes', 'investigations_advised');
    }
}
