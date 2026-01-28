import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from './entities/issue.entity';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
    imports: [TypeOrmModule.forFeature([Issue])],
    controllers: [IssueController],
    providers: [IssueService,
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
    exports: [TypeOrmModule],
})
export class IssueModule { }
