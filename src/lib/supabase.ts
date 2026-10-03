import { createClient } from '@supabase/supabase-js';
import { Branch, Customer, Product, Sale, Supplier, UserProfile, UserRole, UserAccount, StockTransfer } from '../types';

// The Supabase project details provided by user
const RAW_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yioyruhnrcenyxkkgvun.supabase.co';
// Ensure clean base URL without trailing '/rest/v1/'
const SUPABASE_URL = RAW_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpb3lydWhucmNlbnl4a2tndnVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMzY4MjgsImV4cCI6MjEwNTYxMjgyOH0.fMje7z7B8X0TG9oEi5E2QpTxQ0vHvqz8iHdYQxj9OJ4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper service for syncing data with Supabase with rock-solid error handling and feedback
export const SupabaseService = {
  // Check connection status
  async checkConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      if (error) {
        if (error.code === '42P01') {
          return {
            connected: true,
            message: 'Conectado a Supabase (Tablas pendientes de crear con el script SQL proporcionado).',
          };
        }
        return { connected: false, message: `Error Supabase: ${error.message}` };
      }
      return { connected: true, message: 'Conexión activa y sincronizada con Supabase.' };
    } catch (err: any) {
      return { connected: false, message: err?.message || 'Error de conexión con Supabase' };
    }
  },

  // ==========================================
  // BRANCHES (Sucursales)
  // ==========================================
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

  async upsertBranch(branch: Branch): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('branches').upsert({
        id: branch.id,
        name: branch.name,
        code: branch.code,
        address: branch.address || null,
        phone: branch.phone || null,
        manager_name: branch.managerName || null,
        is_main: branch.isMain ?? false,
        is_active: branch.isActive !== false,
      });
      if (error) {
        console.warn('Supabase upsertBranch error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase upsertBranch exception:', err);
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  async deleteBranch(branchId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Unassign any user accounts linked to this branch to avoid foreign key blocks
      try {
        await supabase.from('user_accounts').update({ branch_id: null }).eq('branch_id', branchId);
      } catch {
        // Continue if table doesn't exist
      }
      const { error } = await supabase.from('branches').delete().eq('id', branchId);
      if (error) {
        console.warn('Supabase deleteBranch error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase deleteBranch exception:', err);
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  // ==========================================
  // PRODUCTS (Productos y Precios P1, P2, P3)
  // ==========================================
  async fetchProducts(): Promise<Product[] | null> {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error || !data || data.length === 0) return null;
      return data.map((d: any) => {
        const basePrice = Number(d.price);
        const p1 = d.price1 !== undefined && d.price1 !== null ? Number(d.price1) : (d.price_1 !== undefined && d.price_1 !== null ? Number(d.price_1) : basePrice);
        const p2 = d.price2 !== undefined && d.price2 !== null ? Number(d.price2) : (d.price_2 !== undefined && d.price_2 !== null ? Number(d.price_2) : (d.wholesale_price ? Number(d.wholesale_price) : Math.round(basePrice * 0.9)));
        const p3 = d.price3 !== undefined && d.price3 !== null ? Number(d.price3) : (d.price_3 !== undefined && d.price_3 !== null ? Number(d.price_3) : Math.round(basePrice * 0.84));

        return {
          id: d.id,
          name: d.name,
          sku: d.sku,
          category: d.category,
          price: basePrice,
          price1: p1,
          price2: p2,
          price3: p3,
          costPrice: Number(d.cost_price || 0),
          wholesalePrice: p2,
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

  async upsertProduct(product: Product): Promise<{ success: boolean; error?: string }> {
    const p1 = product.price1 ?? product.price;
    const p2 = product.price2 ?? product.wholesalePrice ?? Math.round(product.price * 0.9);
    const p3 = product.price3 ?? Math.round(product.price * 0.84);

    // Initial payload prioritizing primary standard schema
    const payload: any = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      price1: p1,
      price2: p2,
      price3: p3,
      cost_price: product.costPrice || 0,
      wholesale_price: p2,
      stock: product.stock || 0,
      min_stock: product.minStock || 3,
      branch_stocks: product.branchStocks || {},
      image: product.image || null,
      description: product.description || null,
      is_active: product.isActive !== false,
      specs: product.specs || null,
    };

    let lastError: any = null;

    // Adaptive upsert loop: if remote Supabase schema is missing an optional column,
    // detect it from the PostgREST error, dynamically delete it from payload, and retry.
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        const { error } = await supabase.from('products').upsert(payload);
        if (!error) {
          return { success: true };
        }

        lastError = error;
        const msg = error.message || '';

        // Match missing column in Supabase / PostgREST error message
        const match =
          msg.match(/Could not find the '([^']+)' column/i) ||
          msg.match(/column "?([^" ]+)"? of relation/i) ||
          msg.match(/column "([^"]+)" does not exist/i);

        if (match && match[1] && match[1] in payload) {
          console.warn(`Supabase: Columna '${match[1]}' no presente en tabla 'products'. Adaptando payload y reintentando...`);
          delete payload[match[1]];
          continue;
        }

        // If price1 column wasn't found, try snake_case price_1, price_2, price_3
        if (msg.includes('price1') && !('price_1' in payload)) {
          payload.price_1 = p1;
          payload.price_2 = p2;
          payload.price_3 = p3;
          continue;
        }

        // If unknown error, break to fallback
        break;
      } catch (err: any) {
        lastError = err;
        break;
      }
    }

    // Fallback: Minimal absolute payload with core product columns
    try {
      const minimalPayload = {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        stock: product.stock || 0,
        image: product.image || null,
      };
      const retryMinimal = await supabase.from('products').upsert(minimalPayload);
      if (!retryMinimal.error) {
        return { success: true };
      }
      return { success: false, error: retryMinimal.error.message };
    } catch (err: any) {
      return { success: false, error: lastError?.message || err?.message || 'Error al guardar producto en Supabase' };
    }
  },

  async deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) {
        console.error('Supabase deleteProduct error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase deleteProduct exception:', err);
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  // ==========================================
  // USER ACCOUNTS & PROFILES (Credenciales y Fotos)
  // ==========================================
  async fetchUserAccounts(): Promise<UserAccount[] | null> {
    try {
      const { data, error } = await supabase.from('user_accounts').select('*').order('created_at', { ascending: true });
      if (error || !data || data.length === 0) return null;
      return data.map((d: any) => ({
        id: d.id,
        username: d.username,
        password: d.password,
        name: d.name,
        role: d.role as UserRole,
        branchId: d.branch_id || undefined,
        branchName: d.branch_name || undefined,
        email: d.email || '',
        phone: d.phone || '',
        photoUrl: d.photo_url || undefined,
        position: d.position || undefined,
        bio: d.bio || undefined,
        createdAt: d.created_at || new Date().toISOString(),
      }));
    } catch {
      return null;
    }
  },

  async upsertUserAccount(account: UserAccount): Promise<{ success: boolean; error?: string; message?: string }> {
    let savedInAccounts = false;
    let savedInProfiles = false;
    let lastError: string | undefined = undefined;

    // 1. Try to upsert into user_accounts table
    try {
      const payload: any = {
        id: account.id,
        username: account.username,
        password: account.password || null,
        name: account.name,
        role: account.role,
        branch_id: account.branchId || null,
        branch_name: account.branchName || null,
        email: account.email || null,
        phone: account.phone || null,
        photo_url: account.photoUrl || null,
        position: account.position || null,
        bio: account.bio || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('user_accounts').upsert(payload);
      if (!error) {
        savedInAccounts = true;
      } else {
        console.warn('Supabase upsertUserAccount primary error:', error.message);
        lastError = error.message;

        // If FK error on branch_id, try without branch_id
        if (error.message.includes('foreign key') || error.message.includes('branches')) {
          payload.branch_id = null;
          const retry = await supabase.from('user_accounts').upsert(payload);
          if (!retry.error) {
            savedInAccounts = true;
          }
        }
      }
    } catch (err: any) {
      console.warn('Supabase user_accounts exception:', err);
      lastError = err?.message;
    }

    // 2. Also upsert into profiles table to guarantee persistence in either schema
    try {
      const profilePayload: any = {
        id: account.id,
        role: account.role,
        name: account.name,
        email: account.email || null,
        phone: account.phone || null,
        photo_url: account.photoUrl || null,
        store_name: account.branchName || null,
        position: account.position || null,
        bio: account.bio || null,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase.from('profiles').upsert(profilePayload);
      if (!profileError) {
        savedInProfiles = true;
      } else {
        console.warn('Supabase profiles fallback error:', profileError.message);
      }
    } catch (err) {
      // profiles table might not exist
    }

    if (savedInAccounts || savedInProfiles) {
      return { success: true, message: 'Guardado con éxito en Supabase.' };
    }

    return { success: false, error: lastError || 'Error al guardar en Supabase. Asegúrate de haber ejecutado el SQL.' };
  },

  async deleteUserAccount(accountId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('user_accounts').delete().eq('id', accountId);
      await supabase.from('profiles').delete().eq('id', accountId).maybeSingle();
      if (error) {
        console.warn('Supabase deleteUserAccount error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  // Legacy profiles helper
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

  async upsertProfile(profile: UserProfile): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('profiles').upsert({
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
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  // ==========================================
  // CUSTOMERS (Clientes)
  // ==========================================
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

  async upsertCustomer(customer: Customer): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('customers').upsert({
        id: customer.id,
        name: customer.name,
        business_name: customer.businessName || null,
        phone: customer.phone,
        email: customer.email || null,
        tier: customer.tier || 'Regular',
        address: customer.address || null,
        notes: customer.notes || null,
        total_spent: customer.totalSpent || 0,
        is_active: customer.isActive !== false,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  async deleteCustomer(customerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', customerId);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  // ==========================================
  // SUPPLIERS (Proveedores)
  // ==========================================
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

  async upsertSupplier(supplier: Supplier): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('suppliers').upsert({
        id: supplier.id,
        company_name: supplier.companyName,
        contact_person: supplier.contactPerson || null,
        phone: supplier.phone,
        email: supplier.email || null,
        category: supplier.category || null,
        city: supplier.city || null,
        credit_days: supplier.creditDays || 30,
        is_active: supplier.isActive !== false,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  async deleteSupplier(supplierId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  // ==========================================
  // SALES (Ventas e Historial)
  // ==========================================
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

  async insertSale(sale: Sale): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('sales').insert({
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
      if (error) {
        console.warn('Supabase insertSale error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase insertSale exception:', err);
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  async updateSaleStatus(saleId: string, status: 'Completada' | 'Cancelada'): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('sales').update({ status }).eq('id', saleId);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  async deleteSale(saleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('sales').delete().eq('id', saleId);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  // ==========================================
  // STOCK TRANSFERS (Traspasos Intersucursales)
  // ==========================================
  async fetchTransfers(): Promise<StockTransfer[] | null> {
    try {
      const { data, error } = await supabase.from('stock_transfers').select('*').order('date', { ascending: false });
      if (error || !data || data.length === 0) return null;
      return data.map((d: any) => ({
        id: d.id,
        folio: d.folio,
        sourceBranchId: d.source_branch_id,
        sourceBranchName: d.source_branch_name,
        targetBranchId: d.target_branch_id,
        targetBranchName: d.target_branch_name,
        productId: d.product_id,
        productName: d.product_name,
        productSku: d.product_sku,
        productImage: d.product_image || undefined,
        quantity: Number(d.quantity),
        date: d.date,
        receivedDate: d.received_date || undefined,
        reason: d.reason || undefined,
        performedBy: d.performed_by,
        receivedBy: d.received_by || undefined,
        status: (d.status as any) || 'Recibido',
        rejectionReason: d.rejection_reason || undefined,
        notes: d.notes || undefined,
      }));
    } catch {
      return null;
    }
  },

  async insertTransfer(transfer: StockTransfer): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('stock_transfers').upsert({
        id: transfer.id,
        folio: transfer.folio,
        source_branch_id: transfer.sourceBranchId,
        source_branch_name: transfer.sourceBranchName,
        target_branch_id: transfer.targetBranchId,
        target_branch_name: transfer.targetBranchName,
        product_id: transfer.productId,
        product_name: transfer.productName,
        product_sku: transfer.productSku,
        product_image: transfer.productImage || null,
        quantity: transfer.quantity,
        date: transfer.date,
        received_date: transfer.receivedDate || null,
        reason: transfer.reason || null,
        performed_by: transfer.performedBy,
        received_by: transfer.receivedBy || null,
        status: transfer.status || 'En tránsito',
        rejection_reason: transfer.rejectionReason || null,
        notes: transfer.notes || null,
      });
      if (error) {
        console.warn('Supabase insertTransfer error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Supabase insertTransfer exception:', err);
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  async updateTransferStatus(
    transferId: string,
    status: string,
    receivedBy?: string,
    receivedDate?: string,
    rejectionReason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('stock_transfers').update({
        status,
        received_by: receivedBy || null,
        received_date: receivedDate || new Date().toISOString(),
        rejection_reason: rejectionReason || null,
      }).eq('id', transferId);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  async deleteTransfer(transferId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('stock_transfers').delete().eq('id', transferId);
      if (error) {
        console.error('Supabase deleteTransfer error:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de red' };
    }
  },

  // ==========================================
  // INITIAL DATA SEEDING TO SUPABASE
  // ==========================================
  async seedInitialData(
    products: Product[],
    customers: Customer[],
    suppliers: Supplier[],
    sales: Sale[],
    branches?: Branch[],
    userAccounts?: UserAccount[],
    transfers?: StockTransfer[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (branches && branches.length > 0) {
        for (const b of branches) await this.upsertBranch(b);
      }
      if (userAccounts && userAccounts.length > 0) {
        for (const u of userAccounts) await this.upsertUserAccount(u);
      }
      for (const p of products) await this.upsertProduct(p);
      for (const c of customers) await this.upsertCustomer(c);
      for (const s of suppliers) await this.upsertSupplier(s);
      for (const sa of sales) await this.insertSale(sa);
      if (transfers && transfers.length > 0) {
        for (const t of transfers) await this.insertTransfer(t);
      }
      return { success: true, message: 'Todos los datos iniciales y de muestra se guardaron exitosamente en Supabase.' };
    } catch (err: any) {
      console.error('Error seeding data:', err);
      return { success: false, message: err?.message || 'Error al sincronizar datos iniciales' };
    }
  },

  // ==========================================
  // GLOBAL CLEAR / WIPE OF TEST RECORDS
  // ==========================================
  async clearAllData(): Promise<{ success: boolean; message: string }> {
    try {
      await supabase.from('sales').delete().neq('id', '___none___');
      await supabase.from('stock_transfers').delete().neq('id', '___none___');
      await supabase.from('products').delete().neq('id', '___none___');
      await supabase.from('customers').delete().neq('id', '___none___');
      await supabase.from('suppliers').delete().neq('id', '___none___');
      await supabase.from('user_accounts').delete().neq('id', '___none___');
      await supabase.from('profiles').delete().neq('id', '___none___');
      await supabase.from('branches').delete().neq('id', '___none___');

      return { success: true, message: 'Se eliminaron todos los registros en Supabase exitosamente.' };
    } catch (err: any) {
      console.warn('Error clearing Supabase data:', err);
      return { success: false, message: err?.message || 'Error al vaciar Supabase' };
    }
  },
};
