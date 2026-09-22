export type UserRole = 'Admin' | 'Gerente' | 'Pos: ventas' | 'Supervisor';

export type ProductCategory = 
  | 'Mobiliario' 
  | 'Aparatos' 
  | 'Tintes y Cuidado' 
  | 'Combos y Promos' 
  | 'Uñas y Estética';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
  costPrice: number;
  wholesalePrice?: number;
  stock: number;
  minStock: number;
  image: string;
  description?: string;
  isActive?: boolean;
  specs?: {
    dimensions?: string;
    material?: string;
    warranty?: string;
    hydraulic?: boolean;
    voltage?: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
}

export type PaymentMethod = 'Efectivo' | 'Tarjeta de Crédito / Débito' | 'Transferencia SPEI' | 'Crédito Tienda';

export interface Sale {
  id: string;
  folio: string;
  date: string; // ISO string
  cashierRole: UserRole;
  cashierName: string;
  customerName: string;
  customerId?: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeDue: number;
  status: 'Completada' | 'Cancelada';
  cancellationReason?: string;
}

export interface Customer {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  tier: 'Mayorista' | 'VIP' | 'Regular';
  address: string;
  notes?: string;
  totalSpent: number;
  isActive?: boolean;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: string;
  city: string;
  creditDays: number;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  storeName?: string;
  position?: string;
  bio?: string;
  joinedDate?: string;
}

export type ActiveModule = 'pos' | 'marketplace' | 'products' | 'customers' | 'suppliers' | 'sales' | 'metrics' | 'profile';

