export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
  barcode?: string;
  minStock?: number;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface BluetoothDevice {
  id: string;
  name: string;
  type: 'printer' | 'payment';
  connected: boolean;
}

export interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: Product[];
  productsByCategory: {
    categoryId: string;
    count: number;
  }[];
}

export type PaymentMethod = 'cash' | 'card' | 'nfc';

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  cashChange?: number;
  createdAt: Date;
  printed: boolean;
}

export interface SaleFilters {
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: PaymentMethod;
}