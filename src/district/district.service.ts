import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { orderBy } from 'lodash';
import { Repository } from 'typeorm';
import { CreateDistrictDto } from './dto/create-district.dto';
import { FindDistrictDto } from './dto/find-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { District } from './entities/district.entity';

// import serviceConfig from '../../app_config/service.config.json';
// import { winstonServerLogger } from 'app_config/serverWinston.config';
import { DUPLICATE_RECORD, KEY_SEPARATOR, NO_RECORD } from 'src/app_config/constants';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';
// import {
//   DUPLICATE_RECORD,
//   KEY_SEPARATOR,
//   NO_RECORD,
// } from 'app_config/constants';

@Injectable()
export class DistrictService {
  private readonly logger = winstonServerLogger(DistrictService.name);
  // private readonly relations = serviceConfig.district.relations;
  private readonly relations = [];

  constructor(
    @InjectRepository(District) private readonly repo: Repository<District>,
  ) { }
  async create(createDistrictDto: CreateDistrictDto) {
    const fnName = this.create.name;
    const input = `Input : CreateDistrictDto: ${JSON.stringify(
      createDistrictDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const result = await this.repo.findOneBy({
      name: createDistrictDto.name,
      stateId: createDistrictDto.stateId,
    });

    if (result) {
      this.logger.error(
        `${fnName}: ${DUPLICATE_RECORD} : State id : ${createDistrictDto.name}${KEY_SEPARATOR}${createDistrictDto.stateId} already exists`,
      );
      throw new Error(
        `${DUPLICATE_RECORD} : State id : ${createDistrictDto.name}${KEY_SEPARATOR}${createDistrictDto.stateId} already exists`,
      );
    } else {
      const createStateObj = this.repo.create(createDistrictDto);
      return await this.repo.save(createStateObj);
    }
  }

  findAll(searchCriteria: FindDistrictDto, relationsRequired: boolean = false) {
    const fnName = this.findAll.name;
    const input = `Input : Find District with searchCriteria : ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    let relations = relationsRequired ? this.relations : [];
    return this.repo.find({
      where: searchCriteria,
      relations: relations,
      order: {
        id: 'ASC',
      },
    });
  }

  findOne(searchCriteria: FindDistrictDto, relationsRequired: boolean = false) {
    const fnName = this.findOne.name;
    const input = `Input : Find District with searchCriteria : ${JSON.stringify(
      searchCriteria,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    let relations = relationsRequired ? this.relations : [];
    return this.repo.findOne({ where: searchCriteria, relations: relations });
  }

  findOneById(id: string, relationsRequired: boolean = false) {
    const fnName = this.findOneById.name;
    const input = `Input : Find District by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relations = relationsRequired ? this.relations : [];
    return this.repo.findOne({ where: { id: id }, relations: relations });
  }

  async update(id: string, updateDistrictDto: UpdateDistrictDto) {
    const fnName = this.update.name;
    const input = `Input : Id: ${id} and update object : ${JSON.stringify(
      updateDistrictDto,
    )}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (updateDistrictDto.id == null) {
      this.logger.debug(
        `${fnName} : District Id not found in updateDistrictDto`,
      );
      updateDistrictDto.id = id;
    } else if (updateDistrictDto.id != id) {
      this.logger.error(
        `${fnName} : District Id : ${id} and Update District object Id : ${updateDistrictDto.id} do not match`,
      );
      throw new Error(
        `District Id : ${id} and Update District object Id :  ${updateDistrictDto.id} do not match`,
      );
    }

    const mergedDistrict = await this.repo.preload(updateDistrictDto);

    if (mergedDistrict == null) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : District Id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : District Id : ${id} not found`);
    } else {
      this.logger.debug(
        `${fnName} : Merged District is : ${JSON.stringify(mergedDistrict)}`,
      );

      return await this.repo.save(mergedDistrict);
    }
  }

  delete(id: string) {
    const fnName = this.delete.name;
    const input = `Input : District id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    return this.repo.delete(id);
  }

  async softDelete(id: string, stateToBeSoftDeleted: District) {
    const fnName = this.softDelete.name;
    this.logger.debug(fnName);
    await this.repo.save(stateToBeSoftDeleted);
    const result = await this.repo.softDelete(id);

    if (result.affected === 0) {
      this.logger.error(
        `${fnName} : ${NO_RECORD} : District id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : District id : ${id} not found`);
    } else {
      this.logger.debug(
        `${fnName} : District id : ${id} softDeleted successfully`,
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
        `${fnName} : ${NO_RECORD} : District id : ${id} not found`,
      );
      throw new Error(`${NO_RECORD} : District id : ${id} not found`);
    } else {
      this.logger.debug(`${fnName} District id : ${id} restored successfully`);
      let restored = await this.findOneById(id);
      restored!.deletedBy = undefined;
      this.repo.save(restored!);
      return restored;
    }
  }
}
