import { PartialType } from '@nestjs/mapped-types';
import { Quotation } from '../entity/quotation.entity';

export class CreateQuotationDto extends PartialType(Quotation) { }
