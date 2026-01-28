import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { User } from './entity/user.entity';
// import { CreateUserDto, UpdateUserDto, FindUserDto } from './dto';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, DUPLICATE_RECORD, NO_RECORD, USER_ROLE_URL, USER_ROLE_UPDATE_FROM_USER_URL } from '../app_config/constants';
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
import serviceConfig from '../app_config/service.config.json';


const NO_OF_SALTS = 10;

@Injectable()
export class UserService {
  private schema;
  private appServer;
  private appPort;
  private baseURL;
  private readonly logger = winstonServerLogger(UserService.name);
  private readonly relations = serviceConfig.user.relations;

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


  async findAll(searchCriteria: FindUserDto, relationsRequired?: boolean) {
    const fnName = this.findAll.name;
    const input = `Input : Find User with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relations = relationsRequired ? this.relations : [];
    return this.repo.find({ where: searchCriteria, relations: relations });
  }
  async findOne(searchCriteria: FindUserDto) {
    return this.repo.findOne({ where: searchCriteria });
  }

  async findOneById(id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find User by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    // const user = await this.repo.findOne({ where: { id }, relations: ['userRoles'] });
    const user = await this.repo.findOne({ where: { id } });

    if (!user) {
      this.logger.error(`${fnName} : ${NO_RECORD} : User id : ${id} not found`);
      throw new Error(`${NO_RECORD} : User id : ${id} not found`);
    }
    return user;
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

  async update(id: string, updateUserDto: UpdateUserDto, token?: string) {
    const fnName = this.update.name;
    const input = `Input : user id : ${id}, Update : ${JSON.stringify(
      updateUserDto,
    )}`;
    this.logger.debug(`${fnName} : ${input}`);
    if (updateUserDto.id == null) {
      this.logger.debug(`${fnName} : updateUserDto.id is null`);
      updateUserDto.id = id;
    } else if (updateUserDto.id != id) {
      throw new Error('User Id and update User object Id do not match');
    }
    if (updateUserDto.password != null) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        NO_OF_SALTS,
      );
    }
    const mergedUser = await this.repo.preload(updateUserDto);
    this.logger.debug(`mergedUser : ${JSON.stringify(mergedUser)}`);
    if (mergedUser == null) {
      throw new Error(`${NO_RECORD} : User id : ${id} does not exist`);
    }
    let userToBeSaved: User = mergedUser;

    if (mergedUser.userRoles != null && mergedUser.userRoles.length > 0) {
      this.logger.debug(`${fnName} : User to be saved with roles`);
      const { userRoles, ...mergedUserWithoutRoles } = mergedUser;
      userToBeSaved = this.repo.create(mergedUserWithoutRoles);
      const result = await this.repo.save(userToBeSaved);
      if (result === null) {
        throw new Error(`${NO_RECORD} : User id : ${id} does not exist`);
      }
      const updateUserRoleURL = new URL(
        USER_ROLE_UPDATE_FROM_USER_URL,
        this.baseURL,
      );

      updateUserRoleURL.searchParams.append('userId', id);
      this.logger.debug(`updateUserRoleURL : ${updateUserRoleURL.href}`);
      if (token) {
        this.httpService.axiosRef.defaults.headers.common['Authorization'] =
          getTokenString(token);
      } else {
        throw new Error(`${fnName} : No token found`);
      }
      const updateUserRoleURLResp = await firstValueFrom(
        this.httpService.patch<UserRole[]>(updateUserRoleURL.href, userRoles),
      );
      throwErrIfSrvcRespFailure(updateUserRoleURLResp);
      return updateUserDto;
    } else {
      this.logger.debug(`${fnName} : User to be saved without roles`);
      const user = await this.repo.save(userToBeSaved);
      this.logger.debug(`Saved user : ${JSON.stringify(user)}`);
      return user;
    }
    //}
  }

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

  async delete(id: string, deletedBy: string) {
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

  async softDelete(id: string, deletedBy: string) {
    const fnName = this.softDelete.name;
    const input = `Input : User id : ${id} to be softDeleted`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const User = await this.findOneById(id);
    User.deletedBy = deletedBy;
    await this.repo.save(User);

    const result = await this.repo.softDelete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : User id : ${id} not found`);
      throw new Error(`${NO_RECORD} : User id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : User id : ${id} softDeleted successfully`);
      return result;
    }
  }

  async restore(id: string) {
    const fnName = this.restore.name;
    this.logger.debug(`${fnName} : Restoring User id : ${id}`);

    const result = await this.repo.restore(id);

    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : User id : ${id} not found`);
      throw new Error(`${NO_RECORD} : User id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : User id : ${id} restored successfully`);
      const restored = await this.findOneById(id);
      // restored.deletedBy = null;
      return await this.repo.save(restored);
    }
  }

}
