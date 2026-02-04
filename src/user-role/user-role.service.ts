import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { UserRole, } from './entity/user-role.entity';
import { CreateUserRoleDto, UpdateUserRoleDto, FindUserRoleDto } from './dto';
import { createLogger } from '../app_config/logger';
import { KEY_SEPARATOR, DUPLICATE_RECORD, NO_RECORD } from '../app_config/constants';
// @ts-ignore
import * as _ from 'lodash';
import { RoleType } from 'src/common';

@Injectable()
export class UserRoleService {
  private readonly logger = createLogger(UserRoleService.name);

  constructor(
    @InjectRepository(UserRole)
    private readonly repo: Repository<UserRole>,
  ) { }

  async create(createUserRoleDto: CreateUserRoleDto) {
    const fnName = this.create.name;
    const input = `Input : Create Object : ${JSON.stringify(createUserRoleDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const userRole = await this.repo.findOneBy({
      userId: createUserRoleDto.userId,
      // roleId: createUserRoleDto.roleId,
    });

    if (userRole) {
      this.logger.error(`${fnName} : ${userRole.id} already exists`);
      throw new Error(`${DUPLICATE_RECORD} : ${userRole.id} already exists`);
    } else {
      const userRoleObj = this.repo.create(createUserRoleDto);
      this.logger.debug(`${fnName} : UserRoleObj : ${JSON.stringify(userRoleObj)}`);

      return await this.repo.save(userRoleObj);
    }
  }

  async findAll(searchCriteria?: FindUserRoleDto) {
    console.log("ur service");
    const fnName = this.findAll.name;
    const input = `Input : Find UserRole with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.find({ where: searchCriteria });
  }

  async findOneById(id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find UserRole by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const userRole = await this.repo.findOneBy({ id });
    if (!userRole) {
      this.logger.error(`${fnName} : ${NO_RECORD} : UserRole id : ${id} not found`);
      throw new Error(`${NO_RECORD} : UserRole id : ${id} not found`);
    }
    return userRole;
  }

  async update(id: string, updateUserRoleDto: UpdateUserRoleDto, createdBy: string) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id}, Update Object : ${JSON.stringify(updateUserRoleDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (updateUserRoleDto.id == null) {
      this.logger.debug(`${fnName} : User Id not found in updateUserDto`);
      updateUserRoleDto.id = id;
    } else if (updateUserRoleDto.id != id) {
      this.logger.error(`${fnName} : User Id : ${id} and update User object Id : ${updateUserRoleDto.id} do not match`);
      throw new Error(`User Id : ${id} and update User object Id : ${updateUserRoleDto.id} do not match`);
    }

    const userRoleToBeDeleted = await this.findOneById(id);
    this.logger.debug(`${fnName} : UserRoleToBeDeleted : ${JSON.stringify(userRoleToBeDeleted)}`);

    if (userRoleToBeDeleted) {
      await this.repo.delete(userRoleToBeDeleted.id);

      const newUserRole = new UserRole(updateUserRoleDto);
      newUserRole.createdBy = createdBy;
      this.logger.debug(`${fnName} : New UserRole is : ${JSON.stringify(newUserRole)}`);

      const updatedUserRole = await this.create(newUserRole);
      this.logger.debug(`${fnName} : Created : ${JSON.stringify(updateUserRoleDto)}`);

      return updatedUserRole;
    } else {
      this.logger.error(`${fnName} : ${NO_RECORD} UserRole id : ${id} not found`);
      throw new Error(`${NO_RECORD} : UserRole id : ${id} not found`);
    }
  }

  async updateFromUser(
    userId: string,
    updateUserRoleDTOs: UpdateUserRoleDto[],
    createdBy: string,
  ) {
    const fnName = this.updateFromUser.name;
    const currentUserRoles = await this.findAll({ userId });

    this.logger.debug(`${fnName} : Current UserRoles are : ${JSON.stringify(currentUserRoles)}`);

    const newUserRoles = _.differenceBy(
      updateUserRoleDTOs,
      currentUserRoles,
      (userRole: UpdateUserRoleDto | UserRole) => {
        const userRoleObj = new UserRole(userRole);
        return userRoleObj.getKey();
      },
    );

    this.logger.debug(`${fnName} : New userRoles are : ${JSON.stringify([...newUserRoles])}`);

    const tobeDeletedUserRoles = _.differenceBy(
      currentUserRoles,
      updateUserRoleDTOs,
      (userRole: UpdateUserRoleDto | UserRole) => {
        const userRoleObj = new UserRole(userRole);
        return userRoleObj.getKey();
      },
    );

    this.logger.debug(`${fnName} : UserRoles to be deleted are : ${JSON.stringify([...tobeDeletedUserRoles])}`);

    for (const tobeDeletedUserRole of tobeDeletedUserRoles) {
      const deletedUserRole = await this.delete(tobeDeletedUserRole.id);
      if (deletedUserRole != null && deletedUserRole.affected != null && deletedUserRole.affected > 0) {
        this.logger.debug(`${fnName} : ${JSON.stringify(deletedUserRole)} deleted successfully`);
      } else {
        this.logger.debug(`${fnName} : ${JSON.stringify(deletedUserRole)} not found and could not be deleted`);
      }
    }

    for (const newUserRole of newUserRoles) {
      newUserRole.createdBy = createdBy;
      const createdUserRole = await this.create(newUserRole);
      if (createdUserRole) {
        this.logger.debug(`${fnName} : ${JSON.stringify(createdUserRole)} created successfully`);
      } else {
        this.logger.debug(`${fnName} : ${JSON.stringify(createdUserRole)} could not be created`);
      }
    }

    return {
      added: newUserRoles.length,
      deleted: tobeDeletedUserRoles.length,
    };

  }

  async delete(id: string) {
    const fnName = this.delete.name;
    const input = `Input : UserRole id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      this.logger.error(`${fnName} : ${NO_RECORD} : UserRole id : ${id} not found`);
      throw new Error(`${NO_RECORD} : UserRole id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} : UserRole id : ${id} deleted successfully`);
      return result;
    }
  }

  async deleteByUserId(userId: string, deletedBy: string) {
    const fnName = this.deleteByUserId.name;
    const input = `Input : Delete all roles for userId : ${userId}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const userRoles = await this.findAll({ userId });

    for (const userRole of userRoles) {
      userRole.deletedBy = deletedBy;
      await this.repo.save(userRole);
      await this.repo.softDelete(userRole.id);
    }

    this.logger.debug(`${fnName} : Deleted ${userRoles.length} roles for user ${userId}`);
    return { affected: userRoles.length };
  }

  async getUserRoles(userId: string) {
    const fnName = this.getUserRoles.name;
    const input = `Input : Get roles for user : ${userId}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const roles = await this.repo.find({ where: { userId } });

    this.logger.debug(`${fnName} : Found ${roles.length} roles for user ${userId}`);
    // return roles.map((r) => r.roleId);
  }

  async isStaff(userId: string) {
    const fnName = this.isStaff.name;
    const input = `Input : Check if user ${userId} is staff`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const roles = await this.getUserRoles(userId);
    // const isStaff = roles.some((role) =>
    // [UserRoleEnum.ADMIN, UserRoleEnum.SERVICE_MANAGER, UserRoleEnum.FIELD_ENGINEER].includes(role),
    // );

    // this.logger.debug(`${fnName} : User ${userId} isStaff : ${isStaff}`);
    // return isStaff;
  }

  async hasRole(userId: string, role: RoleType) {
    const fnName = this.hasRole.name;
    const input = `Input : Check if user ${userId} has role ${role}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const roles = await this.getUserRoles(userId);
    // const hasRole = roles.includes(role);

    // this.logger.debug(`${fnName} : User ${userId} hasRole ${role} : ${hasRole}`);
    // return hasRole;
  }

  async findByMultipleUserIds(userIds: string[]) {
    const fnName = this.findByMultipleUserIds.name;
    const input = `Input : Find UserRoles for multiple userIds : ${JSON.stringify(userIds)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.find({
      where: {
        userId: In(userIds),
        deletedAt: IsNull(),
      },
    });
  }
}
