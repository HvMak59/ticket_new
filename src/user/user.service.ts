import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { User } from './entity/user.entity';
// import { CreateUserDto, UpdateUserDto, FindUserDto } from './dto';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, DUPLICATE_RECORD, NO_RECORD, USER_ROLE_URL } from '../app_config/constants';
import { UserRoleService } from '../user-role/user-role.service';
// import { UserRole } from '../common/enums';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleType } from 'src/common';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UserRole } from 'src/user-role/entity/user-role.entity';
import { getTokenString, throwErrIfSrvcRespFailure } from 'src/utils/other';

const NO_OF_SALTS = 10;

@Injectable()
export class UserService {
  private schema;
  private appServer;
  private appPort;
  private baseURL;
  private readonly logger = winstonServerLogger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly httpService: HttpService,
    private readonly userRoleService: UserRoleService,
  ) {
    this.schema = process.env['SCHEMA'];
    this.appServer = process.env['APP_SERVER'];
    this.appPort = process.env['APP_PORT'];
    this.baseURL = `${this.schema}://${this.appServer}:${this.appPort}`;
  }

  // async create(createUserDto: CreateUserDto): Promise<User> {
  //   const fnName = this.create.name;
  //   const input = `Input : ${JSON.stringify(createUserDto)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   if (createUserDto.password != null) {
  //     createUserDto.password = await bcrypt.hash(createUserDto.password, NO_OF_SALTS);
  //   }

  //   const { userRoles, ...createUserWithoutRoles } = createUserDto;

  //   const user = await this.repo.findOneBy({ email: createUserDto.email });

  //   if (user) {
  //     this.logger.error(`${fnName} : ${DUPLICATE_RECORD} for User email : ${createUserDto.email}`);
  //     throw new Error(`${DUPLICATE_RECORD} for User email : ${createUserDto.email}`);
  //   }

  //   const createUserObj = this.repo.create(createUserWithoutRoles);
  //   const createdUser = await this.repo.save(createUserObj);

  //   this.logger.debug(`${fnName} : Saved user ${JSON.stringify(createdUser)}`);

  //   if (userRoles && userRoles.length > 0) {
  //     for (const userRole of userRoles) {
  //       userRole.userId = createdUser.id;
  //       userRole.createdBy = createUserDto.createdBy;
  //       await this.userRoleService.create(userRole);
  //     }
  //   }

  //   return createdUser;
  // }

  async create(token: string, createUserDto: CreateUserDto) {
    const fnName = 'create()';
    const input = `Input : ${JSON.stringify(createUserDto)}`;
    //try {
    this.logger.debug(fnName + KEY_SEPARATOR + 'Start');
    this.logger.debug(fnName + KEY_SEPARATOR + input);
    let user;
    if (createUserDto.password != null) {
      createUserDto.password = await bcrypt.hash(
        createUserDto.password,
        NO_OF_SALTS,
      );
    }
    const { userRoles, ...createUserWithoutRoles } = createUserDto
    user = await this.repo.findOneBy({
      id: createUserDto.id,
    });
    if (user) {
      throw new Error(`${DUPLICATE_RECORD} for User Id : ${createUserDto.id}`);
      //response.status(HttpStatus.OK); //.json(org);
    } else {
      const createUserObj = this.repo.create(createUserWithoutRoles);
      const createdUser = await this.repo.save(createUserObj);

      if (userRoles == null || userRoles.length == 0) {
        this.logger.debug(`No roles assigned to user ${createdUser.id}`);
      } else {
        const createUserRoleURL = new URL(USER_ROLE_URL, this.baseURL);

        this.logger.debug(
          `${fnName} : userRoleURL : ${createUserRoleURL.href}`,
        );

        this.httpService.axiosRef.defaults.headers.common['Authorization'] =
          getTokenString(token);
        const createdUserRoles: UserRole[] = [];

        for (const userRole of userRoles) {
          userRole.userId = createdUser.id;
          this.logger.debug(`UserRole : ${JSON.stringify(userRole)}`);

          const userRoleURLResp = await firstValueFrom(
            this.httpService.post<UserRole>(createUserRoleURL.href, userRole),
          );
          throwErrIfSrvcRespFailure(userRoleURLResp);
          createdUserRoles.push(userRoleURLResp.data);
        }
        createdUser.userRoles = createdUserRoles;
      }
      return createdUser;
    }
  }


  async findAll(searchCriteria?: FindUserDto): Promise<User[]> {
    const fnName = this.findAll.name;
    const input = `Input : Find User with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.find({ where: searchCriteria, relations: ['userRoles'] });
  }
  async findOne(searchCriteria: FindUserDto) {
    return this.repo.findOne({ where: searchCriteria });
  }

  async findOneById(id: string): Promise<User> {
    const fnName = this.findOneById.name;
    const input = `Input : Find User by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const user = await this.repo.findOne({ where: { id }, relations: ['userRoles'] });

    if (!user) {
      this.logger.error(`${fnName} : ${NO_RECORD} : User id : ${id} not found`);
      throw new Error(`${NO_RECORD} : User id : ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const fnName = this.findByEmail.name;
    const input = `Input : Find User by email : ${email}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.findOne({
      where: { email },
      relations: ['userRoles'],
      select: ['id', 'email', 'password', 'phone', 'createdAt', 'updatedAt'],
    });
  }

  // async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
  //   const fnName = this.update.name;
  //   const input = `Input : Id : ${id}, Update object : ${JSON.stringify(updateUserDto)}`;

  //   this.logger.debug(fnName + KEY_SEPARATOR + input);

  //   const { userRoles, ...updateUserWithoutRoles } = updateUserDto;

  //   if (updateUserWithoutRoles.password != null) {
  //     updateUserWithoutRoles.password = await bcrypt.hash(updateUserWithoutRoles.password, NO_OF_SALTS);
  //   }

  //   const mergedUser = await this.repo.preload({ id, ...updateUserWithoutRoles });

  //   if (mergedUser == null) {
  //     this.logger.error(`${fnName} : ${NO_RECORD} : User id : ${id} not found`);
  //     throw new Error(`${NO_RECORD} : User id : ${id} not found`);
  //   }

  //   this.logger.debug(`${fnName} : Merged User is : ${JSON.stringify(mergedUser)}`);
  //   const savedUser = await this.repo.save(mergedUser);

  //   if (userRoles && userRoles.length > 0) {
  //     await this.userRoleService.updateFromUser(id, userRoles, updateUserDto.updatedBy || '');
  //   }

  //   return savedUser;
  // }

  findOneWithPassword(searchUser: FindUserDto) {
    return this.repo
      .createQueryBuilder('user')
      .where(searchUser)
      .select('user.id')
      .addSelect('user.password')
      .getOne();
  }

  async getFieldEngineers(): Promise<User[]> {
    const fnName = this.getFieldEngineers.name;
    this.logger.debug(`${fnName} : Getting all field engineers`);

    const engineers = await this.repo
      .createQueryBuilder('user')
      .innerJoin('user.userRoles', 'userRole')
      .where('userRole.roleId = :role', { role: RoleType.FIELD_ENGINEER })
      .getMany();

    this.logger.debug(`${fnName} : Found ${engineers.length} field engineers`);
    return engineers;
  }

  async delete(id: string, deletedBy: string): Promise<any> {
    const fnName = this.delete.name;
    const input = `Input : User id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const user = await this.findOneById(id);

    if (!user) {
      this.logger.error(`${fnName} : ${NO_RECORD} : User id : ${id} not found`);
      throw new Error(`${NO_RECORD} : User id : ${id} not found`);
    }

    user.deletedBy = deletedBy;
    await this.repo.save(user);

    await this.userRoleService.deleteByUserId(id, deletedBy);

    const result = await this.repo.softDelete(id);

    this.logger.debug(`${fnName} : User id : ${id} deleted successfully`);
    return result;
  }

  async findBySearchTerm(searchTerm: string): Promise<User[]> {
    const fnName = this.findBySearchTerm.name;
    const input = `Input : Search term : ${searchTerm}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.find({
      where: { searchTerm: Like(`%${searchTerm}%`) },
      relations: ['userRoles'],
    });
  }

  async findByMultipleIds(ids: string[]): Promise<User[]> {
    const fnName = this.findByMultipleIds.name;
    const input = `Input : Find Users by multiple ids : ${JSON.stringify(ids)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.find({
      where: { id: In(ids) },
      relations: ['userRoles'],
    });
  }
}
