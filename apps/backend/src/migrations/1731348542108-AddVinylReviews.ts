import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVinylReviews1731348542108 implements MigrationInterface {
  name = 'AddVinylReviews1731348542108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`review\` (\`id\` int NOT NULL AUTO_INCREMENT, \`score\` int NOT NULL, \`description\` varchar(255) NOT NULL, \`vinylId\` int NULL, \`authorId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` ADD CONSTRAINT \`FK_01a98f7acabc7f7ba6d9025bb85\` FOREIGN KEY (\`vinylId\`) REFERENCES \`vinyls\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` ADD CONSTRAINT \`FK_1e758e3895b930ccf269f30c415\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_1e758e3895b930ccf269f30c415\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_01a98f7acabc7f7ba6d9025bb85\``,
    );
    await queryRunner.query(`DROP TABLE \`review\``);
  }
}
