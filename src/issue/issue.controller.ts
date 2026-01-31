import { KEY_SEPARATOR, NO_RECORD, USER_NOT_IN_REQUEST_HEADER } from "src/app_config/constants";
import { createLogger } from "src/app_config/logger";
import { RoleType, Roles, } from "src/common";
import { UserId } from "src/utils/req-user-id-decorator";
import { Body, Controller, Delete, Get, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { IssueService } from "./issue.service";
import { CreateIssueDto } from "./dto/create-issue.dto";
import { UpdateIssueDto } from "./dto/update-issue.dto";
import { FindIssueDto } from "./dto/find-issue.dto";
import { JwtAuthGuard } from "src/auth/entities/jwt-auth-guard";
import { RolesGuard } from "src/common/guards/roles.guard";

@Controller('issue')
export class IssueController {
  private readonly logger = createLogger(IssueController.name);

  constructor(private readonly issueService: IssueService) { }

  @Post()
  async create(
    @UserId() userId: string,
    @Body() createIssueDto: CreateIssueDto,
  ) {
    const fnName = this.create.name;
    const input = `Input : ${JSON.stringify(createIssueDto)}`;

    this.logger.debug(`${fnName}${KEY_SEPARATOR}${input}`);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      createIssueDto.createdBy = userId;
      this.logger.debug(`${fnName} : Calling Create service`);
      return await this.issueService.create(createIssueDto);
    }
  }

  @Patch()
  async update(
    @Query('id') id: string,
    @UserId() userId: string,
    @Body() updateissueDto: UpdateIssueDto,
  ) {
    const fnName = this.update.name;
    const input = `Input : Id : ${id} , updateIssueDto : ${JSON.stringify(updateissueDto)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      updateissueDto.updatedBy = userId;
      this.logger.debug(`${fnName} : Calling update service`);
      return await this.issueService.update(id, updateissueDto);
    }
  }

  @Get()
  async findAll(
    @Query() searchCriteria: FindIssueDto,
  ) {
    const fnName = this.findAll.name;
    const input = `Input : Find issue with searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    this.logger.debug(`${fnName} : Calling findAll service`);
    return await this.issueService.findAll(searchCriteria);
  }

  @Get('relations')
  async findAllWthRelations(
    @Query() searchCriteria: FindIssueDto,
  ) {
    const fnName = this.findAllWthRelations.name;
    const input = `Input : Find issue with relation wheres searchCriteria : ${JSON.stringify(searchCriteria)}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    const relationsRequired = true;
    this.logger.debug(`${fnName} : Calling findAll service`);
    return await this.issueService.findAll(searchCriteria, relationsRequired);
  }


  @Get('id')
  async findOneById(@Query('id') id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find issue by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findOneById service`);

    return await this.issueService.findOneById(id);
  }

  @Delete()
  async remove(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.remove.name;
    const input = `Input : issue id : ${id} to be deleted`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling delete service`);
      return await this.issueService.delete(id);
    }
  }

  @Delete('softDelete')
  async softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : issue id : ${id} to be softDeleted`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    }
    else {
      this.logger.debug(`${fnName}: Calling softDelete service`);
      return await this.issueService.softDelete(id, userId);
    }
  }

  @Patch('restore')
  async restore(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.restore.name;
    const input = `Input : issue id : ${id} to be restored`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      this.logger.debug(`${fnName} : Calling restore service`);
      return await this.issueService.restore(id);
    }
  }
}