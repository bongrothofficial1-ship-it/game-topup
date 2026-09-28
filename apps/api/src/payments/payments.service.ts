import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  async generatePaymentPayload(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            product: true,
            game: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('រកមិនឃើញព័ត៌មានទូទាត់ប្រាក់នេះទេ');
    }

    const amountStr = Number(payment.amount).toFixed(2);
    const mockKhqrString = `00020101021229380016bakong@abaa00010108000000015204599953038405405${amountStr}5802KH5915GAMETOPUP STORE6010PHNOM PENH62240120${payment.order.orderNumber}6304ABCD`;

    return {
      paymentId: payment.id,
      orderNumber: payment.order.orderNumber,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
      status: payment.status,
      qrString: mockKhqrString,
      qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(mockKhqrString)}`,
    };
  }

  async checkStatus(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('រកមិនឃើញព័ត៌មានទូទាត់ប្រាក់ទេ');
    }

    return {
      paymentId: payment.id,
      paymentStatus: payment.status,
      orderStatus: payment.order.orderStatus,
      paidAt: payment.paidAt,
    };
  }

  async simulateSuccess(paymentId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          transactionId: `TXN-${Date.now()}`,
        },
      });

      const order = await tx.order.update({
        where: { id: payment.orderId },
        data: {
          orderStatus: 'COMPLETED',
          paymentStatus: 'PAID',
          completedAt: new Date(),
        },
        include: {
          game: true,
          product: true,
        },
      });

      return { order, payment };
    });

    // ផ្ញើសារ Notification ទៅកាន់ Telegram
    try {
      await this.telegramService.sendOrderNotification({
        orderNumber: result.order.orderNumber,
        gameName: result.order.game.name,
        productName: result.order.product.name,
        totalAmount: result.order.totalAmount.toString(),
        playerData: result.order.playerData as Record<string, string>,
      });
    } catch (error) {
      console.error('Error sending telegram:', error);
    }

    return {
      message: 'ការទូទាត់ត្រូវបានអនុម័តដោយជោគជ័យ',
      order: result.order,
      payment: result.payment,
    };
  }
}