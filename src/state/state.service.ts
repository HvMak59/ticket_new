import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStateDto } from './dto/create-state.dto';
import { FindStateDto } from './dto/find-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { State } from './entities/state.entity';

// import serviceConfig from '../../app_config/service.config.json';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
// import { winstonServerLogger } from 'app_config/serverWinston.config';
// import {
//   DUPLICATE_RECORD,
//   KEY_SEPARATOR,
//   NO_RECORD,
// } from 'app_config/constants';

@Injectable()
export class StateService {
  // private readonly relations = serviceConfig.state.relations;
  private readonly relations = [];

  private readonly logger = winstonServerLogger(StateService.name);
  constructor(
    @InjectRepository(State) private readonly repo: Repository<State>,
  ) { }
  async create(createStateDto: CreateStateDto) {
    const fnName = this.create.name;
    const input = `Input : Create state dto: ${JSON.stringify(createStateDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.findOneBy({
      stateId: createStateDto.stateId,
      countryId: createStateDto.countryId,
    });
    if (result != null) {
      this.logger.error(
        `${fnName}: ${DUPLICATE_RECORD} : State id : ${createStateDto.stateId}${KEY_SEPARATOR}${createStateDto.countryId} already exists`,
      );
      throw new Error(
        `${DUPLICATE_RECORD} : State id : ${createStateDto.stateId}${KEY_SEPARATOR}${createStateDto.countryId} already exists`,
      );
    } else {
      const createStateObj = this.repo.create(createStateDto);
      return await this.repo.save(createStateObj);
    }
  }

  async findAll(searchCriteria: FindStateDto, relationsRequired = false) {
    const fnName = this.findAll.name;
    const input = `Input : Find State with searchCriteria : ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    let relations = relationsRequired ? this.relations : [];
    return this.repo.find({
      relations: relations,
      where: searchCriteria,
    });
  }

  async findOne(searchCriteria: FindStateDto, relationsRequired = false) {
    const fnName = this.findOne.name;
    const input = `Input : Find State with searchCriteria : ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    let relations = relationsRequired ? this.relations : [];
    return this.repo.findOne({ where: searchCriteria, relations: relations });
  }

  findOneById(id: string, relationsRequired: boolean = false) {
    const fnName = this.findOneById.name;
    const input = `Input : Find State by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relations = relationsRequired ? this.relations : [];
    return this.repo.findOne({ where: { id: id }, relations: relations });
  }

  async update(id: string, updateStateDto: UpdateStateDto) {
    const fnName = this.update.name;
    const input = `Input : Id: ${id} and update object : ${JSON.stringify(
      updateStateDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (updateStateDto.id == null) {
      this.logger.debug(`${fnName} : State Id not found in updateStateDto`);
      updateStateDto.id = id;
    } else if (updateStateDto.id != id) {
      this.logger.error(
        `${fnName} : State Id : ${id} and Update State object Id : ${updateStateDto.id} do not match`,
      );
      throw new Error(
        `State Id : ${id} and Update State object Id :  ${updateStateDto.id} do not match`,
      );
    }

    const mergedState = await this.repo.preload(updateStateDto);

    if (mergedState == null) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : State Id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : State Id : ${id} not found`);
    } else {
      this.logger.debug(
        `${fnName} : Merged State is : ${JSON.stringify(mergedState)}`,
      );

      return await this.repo.save(mergedState);
    }
  }

  delete(id: string) {
    const fnName = this.delete.name;
    const input = `Input : State id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.delete(id);
  }

  async softDelete(id: string, stateToBeSoftDeleted: State) {
    const fnName = this.softDelete.name;
    this.logger.debug(fnName);
    await this.repo.save(stateToBeSoftDeleted);
    const result = await this.repo.softDelete(id);

    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : State id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : State id : ${id} not found`);
    } else {
      this.logger.debug(
        `${fnName} : State id : ${id} softDeleted successfully`,
      );
      return result;
    }
  }

  async restore(id: string) {
    const fnName = this.restore.name;
    this.logger.debug(fnName);
    const result = await this.repo.restore(id);
    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : State id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : State id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} State id : ${id} restored successfully`);
      let restored = await this.findOneById(id);
      restored!.deletedBy = undefined;
      this.repo.save(restored!);
      return restored;
    }
  }
}
