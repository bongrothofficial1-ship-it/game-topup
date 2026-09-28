import { Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(':id/qr')
  async getQr(@Param('id') id: string) {
    return this.paymentsService.generatePaymentPayload(id);
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    return this.paymentsService.checkStatus(id);
  }

  @Post(':id/simulate-success')
  async simulateSuccess(@Param('id') id: string) {
    return this.paymentsService.simulateSuccess(id);
  }
}