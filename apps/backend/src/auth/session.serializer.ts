import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: any) {
    done(null, user.id);
  }

  async deserializeUser(userId: number, done: any) {
    try {
      const user = await this.usersService.findOne({ id: userId });
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
}
