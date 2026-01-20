import { PartialType } from '@nestjs/mapped-types';
import { Quotation } from '../entity/quotation.entity';

export class UpdateQuotationDto extends PartialType(Quotation) {}
