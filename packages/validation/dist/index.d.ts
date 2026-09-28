import { z } from 'zod';
export declare const createOrderSchema: z.ZodObject<{
    gameId: z.ZodString;
    productId: z.ZodString;
    playerId: z.ZodString;
    serverId: z.ZodOptional<z.ZodString>;
    quantity: z.ZodDefault<z.ZodNumber>;
    paymentMethodCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    gameId: string;
    productId: string;
    playerId: string;
    quantity: number;
    paymentMethodCode: string;
    serverId?: string | undefined;
}, {
    gameId: string;
    productId: string;
    playerId: string;
    paymentMethodCode: string;
    serverId?: string | undefined;
    quantity?: number | undefined;
}>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
//# sourceMappingURL=index.d.ts.map