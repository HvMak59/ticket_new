import { FindOptionsWhere } from 'typeorm';
import { State } from '../entities/state.entity';

export interface FindStateDto extends FindOptionsWhere<State> {}
