import { KEY_SEPARATOR, NO_RECORD, USER_NOT_IN_REQUEST_HEADER } from "src/app_config/constants";
import { createLogger } from "src/app_config/logger";
import { RoleType, JwtAuthGuard, Roles, RolesGuard } from "src/common";
import { UserId } from "src/utils/req-user-id-decorator";
import { Body, Controller, Delete, Get, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { IssueService } from "./issue.service";
import { CreateIssueDto } from "./dto/create-issue.dto";
import { UpdateIssueDto } from "./dto/update-issue.dto";
import { FindIssueDto } from "./dto/find-issue.dto";

@Controller('issue')
export class IssueController {
  private readonly logger = createLogger(IssueController.name);

  constructor(private readonly issueService: IssueService) { }

  @Post()
  async create(
    @UserId() userId: string,
    @Body() createIssueDto: CreateIssueDto,
  ) {
    console.log("in issue")
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
  @UseGuards(JwtAuthGuard)
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

  @Get('id')
  async findOneById(@Query('id') id: string) {
    const fnName = this.findOneById.name;
    const input = `Input : Find issue by id : ${id}`;

    this.logger.debug(fnName + KEY_SEPARATOR + input);
    this.logger.debug(`${fnName} : Calling findOneById service`);

    return await this.issueService.findOneById(id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async softDelete(@UserId() userId: string, @Query('id') id: string) {
    const fnName = this.softDelete.name;
    const input = `Input : issue id : ${id} to be softDeleted`;
    this.logger.debug(fnName + KEY_SEPARATOR + input);

    if (userId == null) {
      this.logger.error(fnName + KEY_SEPARATOR + USER_NOT_IN_REQUEST_HEADER);
      throw new Error(USER_NOT_IN_REQUEST_HEADER);
    } else {
      const issue = await this.issueService.findOneById(id);
      if (issue) {
        return await this.issueService.softDelete(id, userId);
      } else {
        this.logger.error(`${fnName} : ${NO_RECORD} : issue id : ${id} not found`);
        throw new Error(`issue id : ${id} not found`);
      }
    }
  }

  @Patch('restore')
  @UseGuards(JwtAuthGuard)
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