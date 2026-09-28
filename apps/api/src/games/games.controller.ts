import { Controller, Get, Param } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  async getAllGames() {
    return this.gamesService.findAll();
  }

  @Get(':slug')
  async getGameBySlug(@Param('slug') slug: string) {
    return this.gamesService.findBySlug(slug);
  }
}