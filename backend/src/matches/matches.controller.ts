// backend/src/matches/matches.controller.ts
import { Controller, Get, Param, Post } from '@nestjs/common';

import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  findAll() {
    return this.matchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(+id);
  }

  @Post('refresh')
  async refreshMatches() {
    return this.matchesService.refreshMatches();
  }
}
