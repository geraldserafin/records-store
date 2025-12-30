import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseFloatForVinylPrice1731271819022 implements MigrationInterface {
  name = 'UseFloatForVinylPrice1731271819022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`vinyls\` DROP COLUMN \`price\``);
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` ADD \`price\` float NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`vinyls\` DROP COLUMN \`price\``);
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` ADD \`price\` int NOT NULL`,
    );
  }
}
