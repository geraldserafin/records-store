import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [PassportModule.register({ session: true }), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, SessionSerializer],
})
export class AuthModule {}
