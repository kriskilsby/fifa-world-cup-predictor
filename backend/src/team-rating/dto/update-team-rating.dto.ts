import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamRatingDto } from './create-team-rating.dto';

export class UpdateTeamRatingDto extends PartialType(CreateTeamRatingDto) {}
