import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation } from '../entity/quotation.entity';
import { QUOTATION_ACTION_KEY } from '../quotation-action.decorator';
import { QUOTATION_TRANSITIONS } from '../quotation-transitions';
import { QuotationStatus } from 'src/common';

@Injectable()
export class QuotationStatusGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @InjectRepository(Quotation)
        private quotationRepo: Repository<Quotation>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const action = this.reflector.get<string>(
            QUOTATION_ACTION_KEY,
            context.getHandler(),
        );
        if (!action) return true;

        const req = context.switchToHttp().getRequest();
        const { quotationId } = req.params;
        const user = req.user;

        const quotation = await this.quotationRepo.findOne({
            where: { id: quotationId },
        });
        if (!quotation) throw new NotFoundException('Quotation not found');

        type QuotationRole = keyof typeof QUOTATION_TRANSITIONS;
        type QuotationAction =
            keyof (typeof QUOTATION_TRANSITIONS)[QuotationRole];

        const role = user.role as QuotationRole;
        const actionKey = action as QuotationAction;

        const allowedStatuses: readonly QuotationStatus[] =
            QUOTATION_TRANSITIONS[role]?.[actionKey] ?? [];

        if (!allowedStatuses.includes(quotation.status)) {
            throw new ForbiddenException(
                `Action ${actionKey} not allowed when status is ${quotation.status}`,
            );
        }

        req.quotation = quotation;
        return true;
    }
}
