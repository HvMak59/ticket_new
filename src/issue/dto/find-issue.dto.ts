import { PartialType } from '@nestjs/mapped-types';
import { Issue } from '../entities/issue.entity';
import { FindOptionsWhere } from 'typeorm';

export interface FindIssueDto extends FindOptionsWhere<Issue> { }
