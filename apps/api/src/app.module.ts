import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { GamesModule } from './games/games.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [PrismaModule, GamesModule, OrdersModule, PaymentsModule, TelegramModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}