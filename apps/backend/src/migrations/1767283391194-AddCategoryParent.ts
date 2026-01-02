import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryParent1767283391194 implements MigrationInterface {
    name = 'AddCategoryParent1767283391194'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_category\` ADD \`parentId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_2a11d3c0ea1b2b5b1790f762b9a\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_1e758e3895b930ccf269f30c415\``);
        await queryRunner.query(`ALTER TABLE \`review\` CHANGE \`productId\` \`productId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`review\` CHANGE \`authorId\` \`authorId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` DROP FOREIGN KEY \`FK_ec16da8811dbb98daf542e62370\``);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` DROP FOREIGN KEY \`FK_af69a6cd28d35dc8463762272ed\``);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` CHANGE \`string_value\` \`string_value\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` CHANGE \`number_value\` \`number_value\` double NULL`);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` CHANGE \`boolean_value\` \`boolean_value\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` CHANGE \`productId\` \`productId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` CHANGE \`attribute_id\` \`attribute_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`category_attribute\` DROP FOREIGN KEY \`FK_6ae9fd1960af2eb3b290036c1c8\``);
        await queryRunner.query(`ALTER TABLE \`category_attribute\` CHANGE \`categoryId\` \`categoryId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`product_category\` ADD UNIQUE INDEX \`IDX_96152d453aaea425b5afde3ae9\` (\`name\`)`);
        await queryRunner.query(`ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_ff56834e735fa78a15d0cf21926\``);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`categoryId\` \`categoryId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`purchases\` DROP FOREIGN KEY \`FK_341f0dbe584866284359f30f3da\``);
        await queryRunner.query(`ALTER TABLE \`purchases\` DROP FOREIGN KEY \`FK_a38489c8e5f5c5c98d7bc205d0e\``);
        await queryRunner.query(`ALTER TABLE \`purchases\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`purchases\` CHANGE \`productId\` \`productId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`photo_url\` \`photo_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`first_name\` \`first_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`last_name\` \`last_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`birth_date\` \`birth_date\` datetime NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_9f3c1f1cb07f205f2876bbfc1f\` ON \`category_attribute\` (\`name\`, \`categoryId\`)`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_2a11d3c0ea1b2b5b1790f762b9a\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_1e758e3895b930ccf269f30c415\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` ADD CONSTRAINT \`FK_ec16da8811dbb98daf542e62370\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` ADD CONSTRAINT \`FK_af69a6cd28d35dc8463762272ed\` FOREIGN KEY (\`attribute_id\`) REFERENCES \`category_attribute\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`category_attribute\` ADD CONSTRAINT \`FK_6ae9fd1960af2eb3b290036c1c8\` FOREIGN KEY (\`categoryId\`) REFERENCES \`product_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_category\` ADD CONSTRAINT \`FK_569b30aa4b0a1ad42bcd30916aa\` FOREIGN KEY (\`parentId\`) REFERENCES \`product_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD CONSTRAINT \`FK_ff56834e735fa78a15d0cf21926\` FOREIGN KEY (\`categoryId\`) REFERENCES \`product_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`purchases\` ADD CONSTRAINT \`FK_341f0dbe584866284359f30f3da\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`purchases\` ADD CONSTRAINT \`FK_a38489c8e5f5c5c98d7bc205d0e\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE VIEW \`product_stats\` AS 
    SELECT 
      p.id as productId,
      COALESCE(AVG(r.score), 0) as averageRating
    FROM products p
    LEFT JOIN review r ON r.productId = p.id
    GROUP BY p.id
  `);
        await queryRunner.query(`INSERT INTO \`vinyl_store\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)`, ["vinyl_store","VIEW","product_stats","SELECT \n      p.id as productId,\n      COALESCE(AVG(r.score), 0) as averageRating\n    FROM products p\n    LEFT JOIN review r ON r.productId = p.id\n    GROUP BY p.id"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM \`vinyl_store\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ?`, ["VIEW","product_stats","vinyl_store"]);
        await queryRunner.query(`DROP VIEW \`product_stats\``);
        await queryRunner.query(`ALTER TABLE \`purchases\` DROP FOREIGN KEY \`FK_a38489c8e5f5c5c98d7bc205d0e\``);
        await queryRunner.query(`ALTER TABLE \`purchases\` DROP FOREIGN KEY \`FK_341f0dbe584866284359f30f3da\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_ff56834e735fa78a15d0cf21926\``);
        await queryRunner.query(`ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_569b30aa4b0a1ad42bcd30916aa\``);
        await queryRunner.query(`ALTER TABLE \`category_attribute\` DROP FOREIGN KEY \`FK_6ae9fd1960af2eb3b290036c1c8\``);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` DROP FOREIGN KEY \`FK_af69a6cd28d35dc8463762272ed\``);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` DROP FOREIGN KEY \`FK_ec16da8811dbb98daf542e62370\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_1e758e3895b930ccf269f30c415\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_2a11d3c0ea1b2b5b1790f762b9a\``);
        await queryRunner.query(`DROP INDEX \`IDX_9f3c1f1cb07f205f2876bbfc1f\` ON \`category_attribute\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`birth_date\` \`birth_date\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`last_name\` \`last_name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`first_name\` \`first_name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`photo_url\` \`photo_url\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`purchases\` CHANGE \`productId\` \`productId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`purchases\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`purchases\` ADD CONSTRAINT \`FK_a38489c8e5f5c5c98d7bc205d0e\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`purchases\` ADD CONSTRAINT \`FK_341f0dbe584866284359f30f3da\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`categoryId\` \`categoryId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD CONSTRAINT \`FK_ff56834e735fa78a15d0cf21926\` FOREIGN KEY (\`categoryId\`) REFERENCES \`product_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_category\` DROP INDEX \`IDX_96152d453aaea425b5afde3ae9\``);
        await queryRunner.query(`ALTER TABLE \`category_attribute\` CHANGE \`categoryId\` \`categoryId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`category_attribute\` ADD CONSTRAINT \`FK_6ae9fd1960af2eb3b290036c1c8\` FOREIGN KEY (\`categoryId\`) REFERENCES \`product_category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` CHANGE \`attribute_id\` \`attribute_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` CHANGE \`productId\` \`productId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` CHANGE \`boolean_value\` \`boolean_value\` tinyint NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` CHANGE \`number_value\` \`number_value\` double(22) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` CHANGE \`string_value\` \`string_value\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` ADD CONSTRAINT \`FK_af69a6cd28d35dc8463762272ed\` FOREIGN KEY (\`attribute_id\`) REFERENCES \`category_attribute\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_attribute_value\` ADD CONSTRAINT \`FK_ec16da8811dbb98daf542e62370\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` CHANGE \`authorId\` \`authorId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`review\` CHANGE \`productId\` \`productId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_1e758e3895b930ccf269f30c415\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_2a11d3c0ea1b2b5b1790f762b9a\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_category\` DROP COLUMN \`parentId\``);
    }

}
