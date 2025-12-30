import { AuthProvider } from 'src/users/entities/user.entity';

export class CreateUserDto {
  email: string;
  provider: AuthProvider;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  birthDate?: Date;
}
