import { PartialType } from '@nestjs/mapped-types';
import { Issue } from '../entities/issue.entity';

export class CreateIssueDto extends PartialType(Issue) {}
