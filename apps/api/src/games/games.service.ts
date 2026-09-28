import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.game.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { sortOrder: 'asc' },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          orderBy: { sortOrder: 'asc' },
        },
        requirements: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const game = await this.prisma.game.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          orderBy: { sortOrder: 'asc' },
        },
        requirements: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('រកមិនឃើញហ្គេមនេះទេ');
    }

    return game;
  }
}