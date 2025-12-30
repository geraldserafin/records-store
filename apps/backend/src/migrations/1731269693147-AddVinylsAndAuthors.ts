import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVinylsAndAuthors1731269693147 implements MigrationInterface {
  name = 'AddVinylsAndAuthors1731269693147';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`authors\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`vinyls\` (\`id\` int NOT NULL AUTO_INCREMENT, \`price\` int NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`authorId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` ADD CONSTRAINT \`FK_6bfe27050fb6446426da19e14ea\` FOREIGN KEY (\`authorId\`) REFERENCES \`authors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` DROP FOREIGN KEY \`FK_6bfe27050fb6446426da19e14ea\``,
    );
    await queryRunner.query(`DROP TABLE \`vinyls\``);
    await queryRunner.query(`DROP TABLE \`authors\``);
  }
}
