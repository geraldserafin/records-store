import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUser1731192903192 implements MigrationInterface {
  name = 'AddUser1731192903192';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`provider\` enum ('google') NOT NULL, \`role\` enum ('user', 'admin') NOT NULL DEFAULT 'user', \`photo_url\` varchar(255) NULL, \`first_name\` varchar(255) NULL, \`last_name\` varchar(255) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
