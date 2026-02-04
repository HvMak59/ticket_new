import { SetMetadata } from '@nestjs/common';

export const QUOTATION_ACTION_KEY = 'QUOTATION_ACTION';

export const QuotationAction = (action: string) =>
    SetMetadata(QUOTATION_ACTION_KEY, action);
