export type Role = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface UserSession {
  id: string;
  email: string;
  username: string;
  role: Role;
  status: UserStatus;
}
