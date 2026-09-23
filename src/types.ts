export type UserRole = 'Admin' | 'Gerente' | 'Pos: ventas' | 'Supervisor';

export type ProductCategory = 
  | 'Mobiliario' 
  | 'Aparatos' 
  | 'Tintes y Cuidado' 
  | 'Combos y Promos' 
  | 'Uñas y Estética';

export interface Branch {
  id: string;
  name: string; // Ej: "Sucursal 1 - Matriz", "Sucursal 2 - Centro"
  code: string; // Ej: "SUC-01", "SUC-02"
  address: string;
  phone: string;
  managerName?: string;
  isMain: boolean; // Sucursal Maestra / Principal
  isActive: boolean; // false = bloqueada
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number; // Precio principal / Precio 1
  price1?: number; // Precio 1 (General / Menudeo)
  price2?: number; // Precio 2 (Mayoreo / Salón)
  price3?: number; // Precio 3 (Especial / Distribuidor)
  costPrice: number;
  wholesalePrice?: number;
  stock: number; // Stock global sumado
  minStock: number;
  branchStocks?: Record<string, number>; // branchId -> cantidad en esa sucursal
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

export type PriceTier = 1 | 2 | 3;

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  priceTier?: PriceTier;
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
  branchId?: string;
  branchName?: string;
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

export interface StockTransfer {
  id: string;
  folio: string;
  sourceBranchId: string;
  sourceBranchName: string;
  targetBranchId: string;
  targetBranchName: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  date: string;
  reason?: string;
  performedBy: string;
}

export type ActiveModule = 'pos' | 'marketplace' | 'products' | 'customers' | 'suppliers' | 'sales' | 'metrics' | 'profile' | 'branches';

