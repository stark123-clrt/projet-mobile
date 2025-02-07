import { create } from 'zustand';
import { Product, CartItem, BluetoothDevice, Category, InventoryStats, Sale, PaymentMethod, SaleFilters } from '../types';

interface Store {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  devices: BluetoothDevice[];
  sales: Sale[];
  
  // Product Management
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Category Management
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Cart Management
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Sale Management
  completeSale: (paymentMethod: PaymentMethod, cashReceived?: number) => Sale;
  getSales: (filters?: SaleFilters) => Sale[];
  updateSalePrintStatus: (saleId: string, printed: boolean) => void;
  
  // Device Management
  updateDeviceConnection: (deviceId: string, connected: boolean) => void;
  
  // Stats
  getInventoryStats: () => InventoryStats;
}

export const useStore = create<Store>((set, get) => ({
  products: [],
  categories: [],
  cart: [],
  devices: [
    { id: 'printer', name: 'Imprimante Thermique', type: 'printer', connected: false },
    { id: 'payment', name: 'Terminal de Paiement', type: 'payment', connected: false }
  ],
  sales: [],
  
  addProduct: (product) => 
    set((state) => ({
      products: [...state.products, {
        ...product,
        id: crypto.randomUUID(),
        createdAt: new Date()
      }]
    })),
    
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map(product =>
        product.id === id ? { ...product, ...updates } : product
      )
    })),
    
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter(product => product.id !== id)
    })),
    
  addCategory: (category) =>
    set((state) => ({
      categories: [...state.categories, {
        ...category,
        id: crypto.randomUUID()
      }]
    })),
    
  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map(category =>
        category.id === id ? { ...category, ...updates } : category
      )
    })),
    
  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter(category => category.id !== id)
    })),
  
  addToCart: (product, quantity = 1) => 
    set((state) => {
      const existingItem = state.cart.find(item => item.id === product.id);
      if (existingItem) {
        return {
          cart: state.cart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return { cart: [...state.cart, { ...product, quantity }] };
    }),
    
  updateCartItemQuantity: (productId, quantity) =>
    set((state) => ({
      cart: state.cart.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ).filter(item => item.quantity > 0)
    })),
    
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter(item => item.id !== productId),
    })),
    
  clearCart: () => set({ cart: [] }),
  
  completeSale: (paymentMethod, cashReceived) => {
    const state = get();
    const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const sale: Sale = {
      id: crypto.randomUUID(),
      items: [...state.cart],
      total,
      paymentMethod,
      cashReceived,
      cashChange: cashReceived ? cashReceived - total : undefined,
      createdAt: new Date(),
      printed: false
    };
    
    set((state) => ({
      sales: [...state.sales, sale],
      cart: [] // Clear cart after sale
    }));
    
    // Update product stock
    sale.items.forEach(item => {
      get().updateProduct(item.id, {
        stock: state.products.find(p => p.id === item.id)!.stock - item.quantity
      });
    });
    
    return sale;
  },
  
  getSales: (filters) => {
    const sales = get().sales;
    if (!filters) return sales;
    
    return sales.filter(sale => {
      if (filters.startDate && sale.createdAt < filters.startDate) return false;
      if (filters.endDate && sale.createdAt > filters.endDate) return false;
      if (filters.minAmount && sale.total < filters.minAmount) return false;
      if (filters.maxAmount && sale.total > filters.maxAmount) return false;
      if (filters.paymentMethod && sale.paymentMethod !== filters.paymentMethod) return false;
      return true;
    });
  },
  
  updateSalePrintStatus: (saleId, printed) =>
    set((state) => ({
      sales: state.sales.map(sale =>
        sale.id === saleId ? { ...sale, printed } : sale
      )
    })),
  
  updateDeviceConnection: (deviceId, connected) =>
    set((state) => ({
      devices: state.devices.map(device =>
        device.id === deviceId ? { ...device, connected } : device
      )
    })),
    
  getInventoryStats: () => {
    const state = get();
    const lowStockProducts = state.products.filter(
      product => (product.stock <= (product.minStock || 5))
    );
    
    const productsByCategory = state.categories.map(category => ({
      categoryId: category.id,
      count: state.products.filter(product => product.categoryId === category.id).length
    }));
    
    return {
      totalProducts: state.products.length,
      totalStock: state.products.reduce((sum, product) => sum + product.stock, 0),
      lowStockProducts,
      productsByCategory
    };
  }
}));