import { faker } from '@faker-js/faker';
import { Product } from './products/entities/product.entity';
import { DataSource } from 'typeorm';
import databaseConfig from './config/database.config';
import { Review } from './reviews/entities/review.entity';
import { User } from './users/entities/user.entity';
import { Order } from './purchases/entities/order.entity';
import { OrderItem } from './purchases/entities/order-item.entity';
import { ProductCategory } from './products/entities/product-category.entity';
import { CategoryAttribute, AttributeType } from './products/entities/category-attribute.entity';
import { ProductAttributeValue } from './products/entities/product-attribute-value.entity';
import * as config from 'dotenv';

async function seed() {
  config.config();

  const dbConfig = databaseConfig();
  const socketPath = process.env.DB_SOCKET || process.env.MYSQL_UNIX_PORT;

  const connectionOptions = {
    ...dbConfig,
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "vinyl_store",
    host: socketPath ? undefined : (process.env.DB_HOSTNAME || "localhost"),
    port: socketPath ? undefined : (parseInt(process.env.DB_PORT) || 3306),
    socketPath: socketPath,
    entities: [Product, Review, User, Order, OrderItem, ProductCategory, CategoryAttribute, ProductAttributeValue],
    synchronize: true, // Force schema sync for the new EAV tables
  };

  try {
    const dataSource = await new DataSource(connectionOptions).initialize();
    
    // Clear database to start fresh
    await dataSource.synchronize(true);
    
    console.log('Connected to database (Schema Dropped & Synced)');

    const categoryRepo = dataSource.getRepository(ProductCategory);
    const attributeRepo = dataSource.getRepository(CategoryAttribute);
    const productRepo = dataSource.getRepository(Product);
    const valueRepo = dataSource.getRepository(ProductAttributeValue);
    const reviewRepo = dataSource.getRepository(Review);

    // 1. Setup Vinyl Category & Attributes
    console.log('Creating Vinyl Category...');
    const vinylCat = await categoryRepo.save(categoryRepo.create({ name: 'Vinyl' }));

    const vinylAttrs = await attributeRepo.save([
      attributeRepo.create({ name: 'Artist', type: AttributeType.String, category: vinylCat }),
      attributeRepo.create({ name: 'RPM', type: AttributeType.Number, category: vinylCat }),
    ]);
    
    // 2. Seed Products
    console.log('Seeding Products...');
    for (let i = 0; i < 50; i++) {
      const product = await productRepo.save(productRepo.create({
        name: faker.music.album(),
        description: faker.lorem.paragraph(),
        price: parseFloat(faker.commerce.price()),
        images: [
          faker.image.urlLoremFlickr({ category: 'abstract' }),
          faker.image.urlLoremFlickr({ category: 'technics' }),
          faker.image.urlLoremFlickr({ category: 'business' }),
        ],
        category: vinylCat,
      }));

      // Create Attribute Values
      await valueRepo.save([
        valueRepo.create({
          product,
          attribute: vinylAttrs.find(a => a.name === 'Artist'),
          stringValue: faker.person.fullName()
        }),
        valueRepo.create({
          product,
          attribute: vinylAttrs.find(a => a.name === 'RPM'),
          numberValue: faker.helpers.arrayElement([33, 45])
        })
      ]);

      // Create Reviews
      const reviewCount = faker.number.int({ min: 0, max: 5 });
      for (let j = 0; j < reviewCount; j++) {
        await reviewRepo.save(reviewRepo.create({
          score: faker.number.int({ min: 1, max: 10 }),
          description: faker.lorem.sentence(),
          product: product,
        }));
      }
    }

    console.log('Seeding completed');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();