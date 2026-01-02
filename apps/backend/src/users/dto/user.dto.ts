import { Exclude, Expose, plainToInstance } from 'class-transformer';
import { User } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class UserDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  firstName?: string;

  @Expose()
  @ApiProperty()
  lastName?: string;

  @Expose()
  @ApiProperty()
  photoUrl?: string;

  @Expose()
  @ApiProperty()
  birthDate?: Date;

  @Expose()
  @ApiProperty()
  role: string;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }

  static toInstance(plain: Partial<User>) {
    return plainToInstance(UserDto, plain, { excludeExtraneousValues: true });
  }
}
