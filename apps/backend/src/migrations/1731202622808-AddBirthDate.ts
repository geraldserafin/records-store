import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBirthDate1731202622808 implements MigrationInterface {
  name = 'AddBirthDate1731202622808';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`birth_date\` datetime NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`birth_date\``);
  }
}
