import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findOne(by: { email: string } | { id: number }) {
    const user = this.usersRepository.findOneBy(by);

    if (!user) throw new NotFoundException();

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.usersRepository.update({ id }, updateUserDto);
  }

  delete(id: number) {
    return this.usersRepository.delete(id);
  }
}
