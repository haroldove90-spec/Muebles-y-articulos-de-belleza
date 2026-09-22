import React, { useState, useEffect } from 'react';
import {
  ActiveModule,
  Customer,
  Product,
  Sale,
  Supplier,
  UserRole,
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_SALES,
} from './data/initialData';
import { RoleSelector } from './components/RoleSelector';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { POSModule } from './components/POSModule';
import { MarketplaceModule } from './components/MarketplaceModule';
import { ProductsModule } from './components/ProductsModule';
import { CustomersModule } from './components/CustomersModule';
import { SuppliersModule } from './components/SuppliersModule';
import { SalesModule } from './components/SalesModule';
import { ReceiptModal } from './components/ReceiptModal';

export default function App() {
  // Session / Authentication Role State
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem('pb_active_role');
    return (saved as UserRole) || null;
  });

  // Active Module State
  const [activeModule, setActiveModule] = useState<ActiveModule>('pos');

  // Sidebar Collapse State on Desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Core Data Collections (Initialized with robust realistic mock data)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pb_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('pb_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('pb_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('pb_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  // Receipt Modal State
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);

  // Sync state to localStorage for persistence
  useEffect(() => {
    if (currentRole) {
      localStorage.setItem('pb_active_role', currentRole);
    } else {
      localStorage.removeItem('pb_active_role');
    }
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('pb_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pb_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('pb_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('pb_sales', JSON.stringify(sales));
  }, [sales]);

  // Handle Role Selection
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    setActiveModule('pos'); // Start immediately in POS on login
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentRole(null);
    setActiveReceiptSale(null);
  };

  // Handle Sale Completed in POS
  const handleCompleteSale = (newSale: Sale) => {
    // 1. Add to sales history
    setSales((prev) => [newSale, ...prev]);

    // 2. Decrement stock in products
    setProducts((prev) => {
      return prev.map((prod) => {
        const cartItem = newSale.items.find((it) => it.product.id === prod.id);
        if (cartItem) {
          const newStock = Math.max(0, prod.stock - cartItem.quantity);
          return { ...prod, stock: newStock };
        }
        return prod;
      });
    });

    // 3. Update customer total spent
    if (newSale.customerId) {
      setCustomers((prev) => {
        return prev.map((cust) => {
          if (cust.id === newSale.customerId) {
            return { ...cust, totalSpent: cust.totalSpent + newSale.total };
          }
          return cust;
        });
      });
    }

    // 4. Show printable receipt modal
    setActiveReceiptSale(newSale);
  };

  // Handle Product Actions
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Handle Customer Actions
  const handleAddCustomer = (newCust: Customer) => {
    setCustomers((prev) => [newCust, ...prev]);
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
  };

  // Handle Supplier Actions
  const handleAddSupplier = (newSup: Supplier) => {
    setSuppliers((prev) => [newSup, ...prev]);
  };

  const handleUpdateSupplier = (updated: Supplier) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
  };

  // Handle Sale Cancellation / Refund
  const handleCancelSale = (saleId: string, reason: string) => {
    const saleToCancel = sales.find((s) => s.id === saleId);
    if (!saleToCancel) return;

    // Return stock to inventory
    setProducts((prev) => {
      return prev.map((prod) => {
        const item = saleToCancel.items.find((it) => it.product.id === prod.id);
        if (item) {
          return { ...prod, stock: prod.stock + item.quantity };
        }
        return prod;
      });
    });

    // Mark sale as Cancelada
    setSales((prev) => {
      return prev.map((s) => {
        if (s.id === saleId) {
          return { ...s, status: 'Cancelada' };
        }
        return s;
      });
    });

    alert(`Venta ${saleToCancel.folio} cancelada. Inventario restituido con éxito.`);
  };

  // Quick Action from Marketplace: Add to POS and navigate
  const handleAddToCartAndGoPOS = (product: Product) => {
    setActiveModule('pos');
  };

  // 1. Initial State: Role Selector Screen
  if (!currentRole) {
    return <RoleSelector onSelectRole={handleSelectRole} />;
  }

  // 2. Main Application Shell
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5F7] text-[#1E293B] antialiased selection:bg-[#E6007E] selection:text-white">
      {/* Unified Institutional Header */}
      <Header
        currentRole={currentRole}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        sidebarOpen={!sidebarCollapsed}
      />

      {/* Main Layout Area: Desktop Sidebar + Central Workspace + Mobile Bottom Bar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          currentRole={currentRole}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          onLogout={handleLogout}
        />

        {/* Central Workspace (Render Active Module) */}
        <main className="flex-1 flex flex-col overflow-hidden pb-16 lg:pb-0 relative">
          {activeModule === 'pos' && (
            <POSModule
              products={products}
              customers={customers}
              currentRole={currentRole}
              onCompleteSale={handleCompleteSale}
            />
          )}

          {activeModule === 'marketplace' && (
            <MarketplaceModule
              products={products}
              onAddToCartAndGoPOS={handleAddToCartAndGoPOS}
            />
          )}

          {activeModule === 'products' && (
            <ProductsModule
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeModule === 'customers' && (
            <CustomersModule
              customers={customers}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeModule === 'sales' && (
            <SalesModule
              sales={sales}
              currentRole={currentRole}
              onReprintSale={(sale) => setActiveReceiptSale(sale)}
              onCancelSale={handleCancelSale}
            />
          )}

          {activeModule === 'suppliers' && (
            <SuppliersModule
              suppliers={suppliers}
              onAddSupplier={handleAddSupplier}
              onUpdateSupplier={handleUpdateSupplier}
              onDeleteSupplier={handleDeleteSupplier}
            />
          )}
        </main>
      </div>

      {/* Mobile & Tablet Fixed Bottom Bar */}
      <BottomBar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        currentRole={currentRole}
      />

      {/* Printable Sale Receipt / Ticket Modal */}
      {activeReceiptSale && (
        <ReceiptModal
          sale={activeReceiptSale}
          onClose={() => setActiveReceiptSale(null)}
          onNewSale={() => {
            setActiveReceiptSale(null);
            setActiveModule('pos');
          }}
        />
      )}
    </div>
  );
}
