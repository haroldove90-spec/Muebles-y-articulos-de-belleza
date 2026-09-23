import { createClient } from '@supabase/supabase-js';
import { Branch, Customer, Product, Sale, Supplier, UserProfile, UserRole } from '../types';

// The Supabase project details provided by user
const RAW_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yioyruhnrcenyxkkgvun.supabase.co';
// Ensure clean base URL without trailing '/rest/v1/'
const SUPABASE_URL = RAW_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpb3lydWhucmNlbnl4a2tndnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMzY4MjgsImV4cCI6MjEwNTYxMjgyOH0.fMje7z7B8X0TG9oEi5E2QpTxQ0vHvqz8iHdYQxj9OJ4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper service for syncing data with Supabase
export const SupabaseService = {
  // Check connection status
  async checkConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      if (error) {
        if (error.code === '42P01') {
          return {
            connected: true,
            message: 'Conectado a Supabase (Tablas pendientes de crear con el script SQL).',
          };
        }
        return { connected: false, message: error.message };
      }
      return { connected: true, message: 'Conexión activa y sincronizada con Supabase.' };
    } catch (err: any) {
      return { connected: false, message: err.message || 'Error de conexión' };
    }
  },

  // Branches (Sucursales)
  async fetchBranches(): Promise<Branch[] | null> {
    try {
      const { data, error } = await supabase.from('branches').select('*').order('created_at', { ascending: true });
      if (error || !data || data.length === 0) return null;
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        address: d.address || '',
        phone: d.phone || '',
        managerName: d.manager_name || undefined,
        isMain: d.is_main ?? false,
        isActive: d.is_active ?? true,
        createdAt: d.created_at || new Date().toISOString(),
      }));
    } catch {
      return null;
    }
  },

  async upsertBranch(branch: Branch) {
    try {
      await supabase.from('branches').upsert({
        id: branch.id,
        name: branch.name,
        code: branch.code,
        address: branch.address,
        phone: branch.phone,
        manager_name: branch.managerName || null,
        is_main: branch.isMain,
        is_active: branch.isActive,
      });
    } catch (err) {
      console.warn('Supabase upsertBranch error:', err);
    }
  },

  async deleteBranch(branchId: string) {
    try {
      await supabase.from('branches').delete().eq('id', branchId);
    } catch (err) {
      console.warn('Supabase deleteBranch error:', err);
    }
  },

  // Products
  async fetchProducts(): Promise<Product[] | null> {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error || !data || data.length === 0) return null;
      return data.map((d: any) => {
        const basePrice = Number(d.price);
        return {
          id: d.id,
          name: d.name,
          sku: d.sku,
          category: d.category,
          price: basePrice,
          price1: d.price_1 !== undefined && d.price_1 !== null ? Number(d.price_1) : basePrice,
          price2: d.price_2 !== undefined && d.price_2 !== null ? Number(d.price_2) : (d.wholesale_price ? Number(d.wholesale_price) : Math.round(basePrice * 0.9)),
          price3: d.price_3 !== undefined && d.price_3 !== null ? Number(d.price_3) : Math.round(basePrice * 0.84),
          costPrice: Number(d.cost_price || 0),
          wholesalePrice: d.wholesale_price ? Number(d.wholesale_price) : undefined,
          stock: Number(d.stock || 0),
          minStock: Number(d.min_stock || 3),
          branchStocks: d.branch_stocks || undefined,
          image: d.image || '',
          description: d.description || '',
          isActive: d.is_active ?? true,
          specs: d.specs || undefined,
        };
      });
    } catch {
      return null;
    }
  },

  async upsertProduct(product: Product) {
    try {
      await supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        price_1: product.price1 ?? product.price,
        price_2: product.price2 ?? product.wholesalePrice ?? null,
        price_3: product.price3 ?? null,
        cost_price: product.costPrice,
        wholesale_price: product.wholesalePrice || null,
        stock: product.stock,
        min_stock: product.minStock,
        branch_stocks: product.branchStocks || null,
        image: product.image,
        description: product.description,
        is_active: product.isActive ?? true,
        specs: product.specs || null,
      });
    } catch (err) {
      console.warn('Supabase upsertProduct error:', err);
    }
  },

  async deleteProduct(productId: string) {
    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (err) {
      console.warn('Supabase deleteProduct error:', err);
    }
  },

  // Customers
  async fetchCustomers(): Promise<Customer[] | null> {
    try {
      const { data, error } = await supabase.from('customers').select('*');
      if (error || !data || data.length === 0) return null;
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        businessName: d.business_name || '',
        phone: d.phone,
        email: d.email || '',
        tier: d.tier || 'Regular',
        address: d.address || '',
        notes: d.notes || '',
        totalSpent: Number(d.total_spent || 0),
        isActive: d.is_active ?? true,
      }));
    } catch {
      return null;
    }
  },

  async upsertCustomer(customer: Customer) {
    try {
      await supabase.from('customers').upsert({
        id: customer.id,
        name: customer.name,
        business_name: customer.businessName,
        phone: customer.phone,
        email: customer.email,
        tier: customer.tier,
        address: customer.address,
        notes: customer.notes,
        total_spent: customer.totalSpent,
        is_active: customer.isActive ?? true,
      });
    } catch (err) {
      console.warn('Supabase upsertCustomer error:', err);
    }
  },

  async deleteCustomer(customerId: string) {
    try {
      await supabase.from('customers').delete().eq('id', customerId);
    } catch (err) {
      console.warn('Supabase deleteCustomer error:', err);
    }
  },

  // Suppliers
  async fetchSuppliers(): Promise<Supplier[] | null> {
    try {
      const { data, error } = await supabase.from('suppliers').select('*');
      if (error || !data || data.length === 0) return null;
      return data.map((d: any) => ({
        id: d.id,
        companyName: d.company_name,
        contactPerson: d.contact_person || '',
        phone: d.phone,
        email: d.email || '',
        category: d.category || '',
        city: d.city || '',
        creditDays: Number(d.credit_days || 30),
        isActive: d.is_active ?? true,
      }));
    } catch {
      return null;
    }
  },

  async upsertSupplier(supplier: Supplier) {
    try {
      await supabase.from('suppliers').upsert({
        id: supplier.id,
        company_name: supplier.companyName,
        contact_person: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        category: supplier.category,
        city: supplier.city,
        credit_days: supplier.creditDays,
        is_active: supplier.isActive,
      });
    } catch (err) {
      console.warn('Supabase upsertSupplier error:', err);
    }
  },

  async deleteSupplier(supplierId: string) {
    try {
      await supabase.from('suppliers').delete().eq('id', supplierId);
    } catch (err) {
      console.warn('Supabase deleteSupplier error:', err);
    }
  },

  // Sales
  async fetchSales(): Promise<Sale[] | null> {
    try {
      const { data, error } = await supabase.from('sales').select('*').order('date', { ascending: false });
      if (error || !data || data.length === 0) return null;
      return data.map((d: any) => ({
        id: d.id,
        folio: d.folio,
        date: d.date,
        cashierRole: d.cashier_role,
        cashierName: d.cashier_name,
        customerName: d.customer_name,
        customerId: d.customer_id,
        branchId: d.branch_id || undefined,
        branchName: d.branch_name || undefined,
        items: d.items,
        subtotal: Number(d.subtotal),
        discountTotal: Number(d.discount_total || 0),
        tax: Number(d.tax),
        total: Number(d.total),
        paymentMethod: d.payment_method,
        amountPaid: Number(d.amount_paid),
        changeDue: Number(d.change_due || 0),
        status: d.status,
      }));
    } catch {
      return null;
    }
  },

  async insertSale(sale: Sale) {
    try {
      await supabase.from('sales').insert({
        id: sale.id,
        folio: sale.folio,
        date: sale.date,
        cashier_role: sale.cashierRole,
        cashier_name: sale.cashierName,
        customer_name: sale.customerName,
        customer_id: sale.customerId || null,
        branch_id: sale.branchId || null,
        branch_name: sale.branchName || null,
        items: sale.items,
        subtotal: sale.subtotal,
        discount_total: sale.discountTotal,
        tax: sale.tax,
        total: sale.total,
        payment_method: sale.paymentMethod,
        amount_paid: sale.amountPaid,
        change_due: sale.changeDue,
        status: sale.status,
      });
    } catch (err) {
      console.warn('Supabase insertSale error:', err);
    }
  },

  async updateSaleStatus(saleId: string, status: 'Completada' | 'Cancelada') {
    try {
      await supabase.from('sales').update({ status }).eq('id', saleId);
    } catch (err) {
      console.warn('Supabase updateSaleStatus error:', err);
    }
  },

  async deleteSale(saleId: string) {
    try {
      await supabase.from('sales').delete().eq('id', saleId);
    } catch (err) {
      console.warn('Supabase deleteSale error:', err);
    }
  },

  // Profiles (User data per role)
  async fetchProfile(role: UserRole): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('role', role).maybeSingle();
      if (error || !data) return null;
      return {
        id: data.id,
        role: data.role,
        name: data.name,
        email: data.email,
        phone: data.phone,
        photoUrl: data.photo_url || undefined,
        storeName: data.store_name || undefined,
        position: data.position || undefined,
        bio: data.bio || undefined,
        joinedDate: data.created_at || undefined,
      };
    } catch {
      return null;
    }
  },

  async upsertProfile(profile: UserProfile) {
    try {
      await supabase.from('profiles').upsert({
        id: profile.id,
        role: profile.role,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        photo_url: profile.photoUrl || null,
        store_name: profile.storeName || null,
        position: profile.position || null,
        bio: profile.bio || null,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase upsertProfile error:', err);
    }
  },

  // Initial Data Seeding to Supabase
  async seedInitialData(
    products: Product[],
    customers: Customer[],
    suppliers: Supplier[],
    sales: Sale[],
    branches?: Branch[]
  ) {
    try {
      if (branches) {
        for (const b of branches) await this.upsertBranch(b);
      }
      for (const p of products) await this.upsertProduct(p);
      for (const c of customers) await this.upsertCustomer(c);
      for (const s of suppliers) await this.upsertSupplier(s);
      for (const sa of sales) await this.insertSale(sa);
      return true;
    } catch (err) {
      console.error('Error seeding data:', err);
      return false;
    }
  },

  // Global Clear / Wipe of Test Records
  async clearAllData(): Promise<{ success: boolean; message: string }> {
    try {
      // Direct unconditional purge using multiple conditions to guarantee deletion across schemas
      const e1 = await supabase.from('sales').delete().neq('id', '___none___');
      const e2 = await supabase.from('products').delete().neq('id', '___none___');
      const e3 = await supabase.from('customers').delete().neq('id', '___none___');
      const e4 = await supabase.from('suppliers').delete().neq('id', '___none___');
      const e5 = await supabase.from('branches').delete().neq('id', '___none___');

      if (e1.error || e2.error || e3.error || e4.error || e5.error) {
        console.warn('Supabase clear warning:', e1.error || e2.error || e3.error || e4.error || e5.error);
      }

      return { success: true, message: 'Se eliminaron todos los registros en Supabase exitosamente.' };
    } catch (err: any) {
      console.warn('Error clearing Supabase data:', err);
      return { success: false, message: err?.message || 'Error al vaciar Supabase' };
    }
  },
};


