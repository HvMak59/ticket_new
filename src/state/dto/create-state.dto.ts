import { PartialType } from '@nestjs/mapped-types';
import { State } from '../entities/state.entity';

export class CreateStateDto extends PartialType(State) {}
