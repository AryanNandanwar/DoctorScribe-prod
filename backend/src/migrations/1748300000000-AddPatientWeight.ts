import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPatientWeight1748300000000 implements MigrationInterface {
  name = 'AddPatientWeight1748300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "weight" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN IF EXISTS "weight"`);
  }
}
