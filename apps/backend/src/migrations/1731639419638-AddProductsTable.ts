import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductsTable1731639419638 implements MigrationInterface {
  name = 'AddProductsTable1731639419638';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_01a98f7acabc7f7ba6d9025bb85\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` CHANGE \`vinylId\` \`productId\` int NULL DEFAULT NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE \`products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`price\` float NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`product_type\` ENUM('vinyl') NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(`ALTER TABLE \`vinyls\` DROP COLUMN \`name\``);
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` DROP COLUMN \`description\``,
    );
    await queryRunner.query(`ALTER TABLE \`vinyls\` DROP COLUMN \`price\``);
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` ADD \`productId\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` ADD UNIQUE INDEX \`IDX_a2bcd6fd55fe29fb9c7d60b486\` (\`productId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`photo_url\` \`photo_url\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`first_name\` \`first_name\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`last_name\` \`last_name\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`birth_date\` \`birth_date\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_1e758e3895b930ccf269f30c415\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` CHANGE \`productId\` \`productId\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` CHANGE \`authorId\` \`authorId\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` DROP FOREIGN KEY \`FK_6bfe27050fb6446426da19e14ea\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` CHANGE \`authorId\` \`authorId\` int NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_a2bcd6fd55fe29fb9c7d60b486\` ON \`vinyls\` (\`productId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` ADD CONSTRAINT \`FK_2a11d3c0ea1b2b5b1790f762b9a\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` ADD CONSTRAINT \`FK_1e758e3895b930ccf269f30c415\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` ADD CONSTRAINT \`FK_6bfe27050fb6446426da19e14ea\` FOREIGN KEY (\`authorId\`) REFERENCES \`authors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` ADD CONSTRAINT \`FK_a2bcd6fd55fe29fb9c7d60b486e\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`CREATE VIEW \`product_stats\` AS 
    SELECT 
      p.id as productId,
      COALESCE(AVG(r.score), 0) as averageRating
    FROM products p
    LEFT JOIN review r ON r.productId = p.id
    GROUP BY p.id
  `);
    await queryRunner.query(
      `INSERT INTO \`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`,
      [
        'vinyl_store',
        'VIEW',
        'product_stats',
        'SELECT \n      p.id as productId,\n      COALESCE(AVG(r.score), 0) as averageRating\n    FROM products p\n    LEFT JOIN review r ON r.productId = p.id\n    GROUP BY p.id',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM \`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`,
      ['VIEW', 'product_stats', 'vinyl_store'],
    );
    await queryRunner.query(`DROP VIEW \`product_stats\``);
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` DROP FOREIGN KEY \`FK_a2bcd6fd55fe29fb9c7d60b486e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` DROP FOREIGN KEY \`FK_6bfe27050fb6446426da19e14ea\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_1e758e3895b930ccf269f30c415\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_2a11d3c0ea1b2b5b1790f762b9a\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_a2bcd6fd55fe29fb9c7d60b486\` ON \`vinyls\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` CHANGE \`authorId\` \`authorId\` int NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` ADD CONSTRAINT \`FK_6bfe27050fb6446426da19e14ea\` FOREIGN KEY (\`authorId\`) REFERENCES \`authors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` CHANGE \`authorId\` \`authorId\` int NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` CHANGE \`productId\` \`productId\` int NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` ADD CONSTRAINT \`FK_1e758e3895b930ccf269f30c415\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`birth_date\` \`birth_date\` datetime NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`last_name\` \`last_name\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`first_name\` \`first_name\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`photo_url\` \`photo_url\` varchar(255) NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` DROP INDEX \`IDX_a2bcd6fd55fe29fb9c7d60b486\``,
    );
    await queryRunner.query(`ALTER TABLE \`vinyls\` DROP COLUMN \`productId\``);
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` ADD \`price\` float(12) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` ADD \`description\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`vinyls\` ADD \`name\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE \`products\``);
    await queryRunner.query(
      `ALTER TABLE \`review\` CHANGE \`productId\` \`vinylId\` int NULL DEFAULT 'NULL'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`review\` ADD CONSTRAINT \`FK_01a98f7acabc7f7ba6d9025bb85\` FOREIGN KEY (\`vinylId\`) REFERENCES \`vinyls\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
