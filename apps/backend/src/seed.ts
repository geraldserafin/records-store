import { faker } from '@faker-js/faker';
import { Record } from './records/entities/record.entity';
import { DataSource } from 'typeorm';
import databaseConfig from './config/database.config';
import { Review } from './reviews/entities/review.entity';
import { User } from './users/entities/user.entity';
import { Order } from './purchases/entities/order.entity';
import { OrderItem } from './purchases/entities/order-item.entity';
import { Artist } from './artists/entities/artist.entity';
import { Genre } from './genres/entities/genre.entity';
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
    entities: [Record, Review, User, Order, OrderItem, Artist, Genre],
    synchronize: true, 
  };

  try {
    const dataSource = await new DataSource(connectionOptions).initialize();
    
    // Clear database to start fresh
    await dataSource.synchronize(true);
    
    console.log('Connected to database (Schema Dropped & Synced)');

    const recordRepo = dataSource.getRepository(Record);
    const reviewRepo = dataSource.getRepository(Review);
    const artistRepo = dataSource.getRepository(Artist);
    const genreRepo = dataSource.getRepository(Genre);

    // 1. Seed Artists
    console.log('Seeding Artists...');
    const artists = [];
    for (let i = 0; i < 20; i++) {
      const name = faker.person.fullName();
      const artist = await artistRepo.save(artistRepo.create({
        name,
        slug: faker.helpers.slugify(name).toLowerCase() + '-' + faker.string.alphanumeric(5),
        bio: faker.lorem.paragraph(),
        image: faker.image.avatar(),
      }));
      artists.push(artist);
    }

    // 2. Seed Genres
    console.log('Seeding Genres...');
    const genres = [];
    const genreNames = ['Rock', 'Jazz', 'Hip Hop', 'Electronic', 'Classical', 'Pop', 'Blues', 'Country'];
    for (const name of genreNames) {
      const genre = await genreRepo.save(genreRepo.create({
        name,
        slug: name.toLowerCase(),
        description: faker.lorem.sentence(),
      }));
      genres.push(genre);
    }
    
    // 3. Seed Records
    console.log('Seeding Records...');
    for (let i = 0; i < 50; i++) {
      const mainArtist = faker.helpers.arrayElement(artists);
      const coArtists = faker.helpers.arrayElements(artists.filter(a => a.id !== mainArtist.id), { min: 0, max: 2 });
      const recordGenres = faker.helpers.arrayElements(genres, { min: 1, max: 3 });

      const record = await recordRepo.save(recordRepo.create({
        name: faker.music.album(),
        description: faker.lorem.paragraph(),
        shortDescription: faker.lorem.sentence(),
        price: parseFloat(faker.commerce.price()),
        images: [
          faker.image.urlLoremFlickr({ category: 'abstract' }),
        ],
        stock: faker.number.int({ min: 0, max: 100 }),
        mainArtist,
        coArtists,
        genres: recordGenres,
      }));

      // Create Reviews
      const reviewCount = faker.number.int({ min: 0, max: 5 });
      for (let j = 0; j < reviewCount; j++) {
        await reviewRepo.save(reviewRepo.create({
          score: faker.number.int({ min: 1, max: 10 }),
          description: faker.lorem.sentence(),
          record: record,
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
