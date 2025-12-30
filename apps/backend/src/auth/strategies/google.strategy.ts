import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth2';
import googleConfig from 'src/config/google.config';
import { AuthService } from '../auth.service';
import { AuthProvider } from 'src/users/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleConfig.KEY)
    configService: ConfigType<typeof googleConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.clientID,
      clientSecret: configService.clientSecret,
      callbackURL: configService.callbackURL,
      scope: ['profile', 'email'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    return this.authService.validateUser({
      provider: AuthProvider.GOOGLE,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      photoUrl: photos[0].value,
    });
  }
}
