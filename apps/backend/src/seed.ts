import { faker } from '@faker-js/faker';
import { Vinyl } from './vinyls/entities/vinyl.entity';
import { Author } from './authors/entities/author.entity';
import { Product } from './products/entities/product.entity';
import { DataSource } from 'typeorm';
import databaseConfig from './config/database.config';
import { Review } from './reviews/entities/review.entity';
import { User } from './users/entities/user.entity';
import { Purchase } from './purchases/entities/purchase.entity';
import * as config from 'dotenv';

async function seed() {
  config.config();

  console.log({
    ...databaseConfig(),
    password: process.env.MYSQLPASSWORD,
    username: process.env.MYSQLUSER,
    host: process.env.MYSQLHOST,
    port: parseInt(process.env.MYSQLPORT),
    socketPath: undefined,
    database: process.env.MYSQLDATABASE,
    entities: [Author, Product, Vinyl, Review, Author, User, Purchase],
  });
  try {
    const dataSource = await new DataSource({
      ...databaseConfig(),
      password: process.env.MYSQLPASSWORD,
      username: process.env.MYSQLUSER,
      host: process.env.MYSQLHOST,
      port: parseInt(process.env.MYSQLPORT),
      database: process.env.MYSQLDATABASE,
      socketPath: undefined,
      entities: [Author, Product, Vinyl, Review, Author, User, Purchase],
    }).initialize();

    const authorsRepository = dataSource.getRepository(Author);
    const productsRepository = dataSource.getRepository(Product);
    const vinylsRepository = dataSource.getRepository(Vinyl);
    const reviewsRepository = dataSource.getRepository(Review);

    console.log('Connected to database');

    const authors = [];
    for (let i = 0; i < 10; i++) {
      authors.push(authorsRepository.create({ name: faker.person.fullName() }));
    }

    await authorsRepository.save(authors);

    const vinyls = [];
    const reviews = [];
    for (let i = 0; i < 50; i++) {
      const product = productsRepository.create({
        name: faker.music.album(),
        description: faker.lorem.paragraph(),
        price: parseFloat(faker.commerce.price()),
      });

      const reviewCount = faker.number.int({ min: 0, max: 10 });

      for (let j = 0; j < reviewCount; j++) {
        reviews.push(
          reviewsRepository.create({
            score: faker.number.int({ min: 1, max: 10 }),
            description: faker.lorem.paragraph(),
            product: { id: product.id },
            author: null,
          }),
        );
      }

      const vinyl = vinylsRepository.create({
        author: faker.helpers.arrayElement(authors),
        product,
      });

      vinyls.push(vinyl);
    }

    await vinylsRepository.save(vinyls);
    await reviewsRepository.save(reviews);

    console.log('Seeding completed');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seed();
