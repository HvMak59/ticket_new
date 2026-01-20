import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from './entities/issue.entity';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';

@Module({
    imports: [TypeOrmModule.forFeature([Issue])],
    controllers: [IssueController],
    providers: [IssueService],
    exports: [TypeOrmModule],
})
export class IssueModule { }
