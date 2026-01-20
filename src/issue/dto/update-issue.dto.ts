import { PartialType } from '@nestjs/mapped-types';
import { Issue } from '../entities/issue.entity';

export class UpdateIssueDto extends PartialType(Issue) { }
