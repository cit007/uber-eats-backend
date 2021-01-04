import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async createAccount(
    createAccountInput: CreateAccountInput,
  ): Promise<{ ok: boolean; error?: string }> {
    const { email, password, role } = createAccountInput;
    // check new user
    try {
      const isMail = await this.users.findOne({ email });
      if (isMail) {
        return { ok: false, error: 'user exists already' };
      }
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'could not create account' };
    }
    // hash password in user.entity.ts using @BeforeInsert
  }

  async login(loginInput: LoginInput): Promise<LoginOutput> {
    const { email, password } = loginInput;
    console.log('login :', email, password);
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return { ok: false, error: 'user not found' };
      }

      const isPwdOk = await user.checkPassword(password);
      if (!isPwdOk) {
        return { ok: false, error: 'wrong password' };
      }
      return { ok: true, token: 'dummy test token' };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
