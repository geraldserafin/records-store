import { Module } from '@nestjs/common';
import configModule from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthenticatedGuard } from './auth/guards/authenticated.guard';
import { ProductsModule } from './products/products.module';
import { PurchasesModule } from './purchases/purchases.module';
import { EmailsModule } from './emails/emails.module';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticatedGuard,
    },
  ],
  imports: [
    configModule,
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    AuthModule,
    UsersModule,
    ProductsModule,
    ReviewsModule,
    PurchasesModule,
    EmailsModule,
  ],
})
export class AppModule {}
