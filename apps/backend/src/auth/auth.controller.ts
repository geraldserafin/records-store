import {
  Controller,
  Get,
  Inject,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { Public } from './decorators/access.decorator';
import appConfig from 'src/config/app.config';
import { ConfigType } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(appConfig.KEY)
    private configService: ConfigType<typeof appConfig>,
  ) {}

  @Public()
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth authentication' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google login page',
  })
  async auth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  @Redirect()
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiOkResponse({ description: 'Successfully authenticated with Google' })
  async googleAuthCallback() {
    return { url: `${this.configService.appUrl}/users/me` };
  }

  @Get('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiOkResponse({ description: 'Successfully logged out' })
  logout(@Req() req: any) {
    req.session.destroy();
  }
}
