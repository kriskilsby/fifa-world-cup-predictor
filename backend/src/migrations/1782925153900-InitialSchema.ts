// backend/src/migrations/1782925153900-InitialSchema.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Existing database already contains schema.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No-op
  }
}
