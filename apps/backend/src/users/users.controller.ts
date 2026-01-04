import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/access.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get('me')
  @ApiOperation({ summary: "Return the authenticated user's profile" })
  @ApiOkResponse({ type: () => UserDto })
  async me(@CurrentUser() user: User) {
    if (!user) return null;
    return UserDto.toInstance(user);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get public user profile' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne({ id });
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      photoUrl: user.photoUrl,
    };
  }

  @Patch('me')
  @ApiOperation({ summary: "Update the authenticated user's profile" })
  @ApiOkResponse({ description: 'User updated' })
  async updateMe(
    @CurrentUser() { id }: UserDto,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    this.usersService.update(id, updateUserDto);
  }

  @Delete('me')
  @ApiOperation({ summary: "Delete the authenticated user's account" })
  @ApiOkResponse({ description: 'Account deleted' })
  async deleteMe(@CurrentUser() { id }: UserDto) {
    await this.usersService.delete(id);
  }
}