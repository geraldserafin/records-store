import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPurchasesTable1731686347337 implements MigrationInterface {
  name = 'AddPurchasesTable1731686347337';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`purchases\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NULL, \`productId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchases\` ADD CONSTRAINT \`FK_0971e59016705c22b5cec1e99ef\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchases\` ADD CONSTRAINT \`FK_5394f9eea5bfe473faf3bc9cee4\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`purchases\` DROP FOREIGN KEY \`FK_5394f9eea5bfe473faf3bc9cee4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`purchases\` DROP FOREIGN KEY \`FK_0971e59016705c22b5cec1e99ef\``,
    );
    await queryRunner.query(`DROP TABLE \`purchases\``);
  }
}
