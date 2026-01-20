import { FindOptionsWhere } from 'typeorm';
import { Quotation } from '../entity/quotation.entity';

export interface FindQuotationDto extends FindOptionsWhere<Quotation> {}
