import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validateUser(user: CreateUserDto) {
    const dbUser = await this.userRepository.findOneBy({ email: user.email });

    if (dbUser) {
      return dbUser;
    }

    const newUser = this.userRepository.create(user);
    newUser.role = UserRole.USER;

    return await this.userRepository.save(newUser);
  }
}
