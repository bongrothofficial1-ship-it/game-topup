import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateOrderDto {
  gameId: string;
  productId: string;
  paymentMethodCode: string;
  playerData: Record<string, string>;
  idempotencyKey?: string;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto) {
    if (dto.idempotencyKey) {
      const existingOrder = await this.prisma.order.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
        include: { product: true, game: true, payments: true },
      });
      if (existingOrder) {
        return { order: existingOrder };
      }
    }

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { game: { include: { requirements: true } } },
    });

    if (!product || product.gameId !== dto.gameId) {
      throw new NotFoundException('រកមិនឃើញកញ្ចប់ទំនិញដែលបានជ្រើសរើសឡើយ');
    }

    for (const req of product.game.requirements) {
      if (req.required && !dto.playerData?.[req.fieldName]) {
        throw new BadRequestException(`សូមបំពេញ ${req.label}`);
      }
    }

    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { code: dto.paymentMethodCode },
    });

    if (!paymentMethod || !paymentMethod.status) {
      throw new BadRequestException('វិធីសាស្ត្រទូទាត់ប្រាក់នេះមិនទាន់អាចប្រើបានទេ');
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.$transaction(async (tx: any) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          gameId: product.gameId,
          productId: product.id,
          playerData: dto.playerData,
          quantity: 1,
          unitPrice: product.price,
          totalAmount: product.price,
          currency: product.currency,
          orderStatus: 'PENDING',
          paymentStatus: 'UNPAID',
          idempotencyKey: dto.idempotencyKey,
        },
        include: {
          product: true,
          game: true,
        },
      });

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: paymentMethod.provider,
          amount: product.price,
          currency: product.currency,
          status: 'PENDING',
        },
      });

      return {
        order,
        payment,
      };
    });
  }

  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        product: true,
        game: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('រកមិនឃើញការកុម្ម៉ង់នេះទេ');
    }

    return order;
  }

  async getOrderByNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        product: true,
        game: true,
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('រកមិនឃើញការកុម្ម៉ង់ដែលមានលេខកូដនេះទេ');
    }

    return order;
  }

  async getAdminStats() {
    const totalOrders = await this.prisma.order.count();
    const completedOrders = await this.prisma.order.count({
      where: { orderStatus: 'COMPLETED' },
    });
    const pendingOrders = await this.prisma.order.count({
      where: { orderStatus: 'PENDING' },
    });

    const revenueResult = await this.prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { totalAmount: true },
    });

    const recentOrders = await this.prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        game: true,
        product: true,
      },
    });

    return {
      stats: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue: revenueResult._sum.totalAmount || 0,
      },
      recentOrders,
    };
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        game: true,
        product: true,
        payments: true,
      },
    });
  }
}