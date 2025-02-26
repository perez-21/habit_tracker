import { PartialType } from '@nestjs/mapped-types';
import { CreateHabitlogDto } from './create-habitlog.dto';

export class UpdateHabitlogDto extends PartialType(CreateHabitlogDto) {}
