import React, { useState, useEffect } from 'react';
import {
  ActiveModule,
  Branch,
  Customer,
  Product,
  Sale,
  Supplier,
  UserRole,
  StockTransfer,
  UserAccount,
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_SALES,
  INITIAL_BRANCHES,
  INITIAL_TRANSFERS,
  INITIAL_USER_ACCOUNTS,
} from './data/initialData';
import { RoleSelector } from './components/RoleSelector';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { POSModule } from './components/POSModule';
import { ProductsModule } from './components/ProductsModule';
import { BranchesModule } from './components/BranchesModule';
import { CustomersModule } from './components/CustomersModule';
import { SuppliersModule } from './components/SuppliersModule';
import { SalesModule } from './components/SalesModule';
import { MetricsModule } from './components/MetricsModule';
import { ProfileModule } from './components/ProfileModule';
import { TransfersModule } from './components/TransfersModule';
import { ReceiptModal } from './components/ReceiptModal';
import { SupabaseModal } from './components/SupabaseModal';
import { GlobalClearModal } from './components/GlobalClearModal';
import { SupabaseService } from './lib/supabase';

export default function App() {
  // Session / Authentication Role State
  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem('pb_active_role');
    return (saved as UserRole) || null;
  });

  // User Accounts (per branch) state
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const hasCleared = localStorage.getItem('pb_cleared_test_data') === 'true';
    const saved = localStorage.getItem('pb_user_accounts');
    if (saved) return JSON.parse(saved);
    return hasCleared ? [] : INITIAL_USER_ACCOUNTS;
  });

  // Logged-in User Account
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('pb_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    const savedRole = localStorage.getItem('pb_active_role') as UserRole | null;
    if (savedRole) {
      const savedAccounts = localStorage.getItem('pb_user_accounts');
      const list: UserAccount[] = savedAccounts ? JSON.parse(savedAccounts) : INITIAL_USER_ACCOUNTS;
      return list.find((a) => a.role === savedRole) || null;
    }
    return null;
  });

  // Active Module State (Role-specific default)
  const [activeModule, setActiveModule] = useState<ActiveModule>(() => {
    const savedRole = localStorage.getItem('pb_active_role') as UserRole | null;
    if (savedRole === 'Pos: ventas') return 'pos';
    if (savedRole === 'Admin') return 'metrics';
    if (savedRole === 'Gerente') return 'products';
    return 'metrics';
  });

  // Sidebar Collapse State on Desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Multi-branch state
  const [branches, setBranches] = useState<Branch[]>(() => {
    const hasCleared = localStorage.getItem('pb_cleared_test_data') === 'true';
    const saved = localStorage.getItem('pb_branches');
    if (saved) return JSON.parse(saved);
    return hasCleared ? [] : INITIAL_BRANCHES;
  });

  const [activeBranchId, setActiveBranchId] = useState<string>(() => {
    const saved = localStorage.getItem('pb_active_branch_id');
    return saved || 'branch-1';
  });

  // Core Data Collections (Initialized with robust realistic mock data or empty if cleared)
  const [products, setProducts] = useState<Product[]>(() => {
    const hasCleared = localStorage.getItem('pb_cleared_test_data') === 'true';
    const saved = localStorage.getItem('pb_products');
    if (saved) return JSON.parse(saved);
    return hasCleared ? [] : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const hasCleared = localStorage.getItem('pb_cleared_test_data') === 'true';
    const saved = localStorage.getItem('pb_customers');
    if (saved) return JSON.parse(saved);
    return hasCleared ? [] : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const hasCleared = localStorage.getItem('pb_cleared_test_data') === 'true';
    const saved = localStorage.getItem('pb_suppliers');
    if (saved) return JSON.parse(saved);
    return hasCleared ? [] : INITIAL_SUPPLIERS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const hasCleared = localStorage.getItem('pb_cleared_test_data') === 'true';
    const saved = localStorage.getItem('pb_sales');
    if (saved) return JSON.parse(saved);
    return hasCleared ? [] : INITIAL_SALES;
  });

  const [transfers, setTransfers] = useState<StockTransfer[]>(() => {
    const hasCleared = localStorage.getItem('pb_cleared_test_data') === 'true';
    const saved = localStorage.getItem('pb_transfers');
    if (saved) return JSON.parse(saved);
    return hasCleared ? [] : INITIAL_TRANSFERS;
  });

  // Receipt Modal State
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);

  // Supabase Sync Modal State
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  // Global Clear Modal State
  const [showGlobalClearModal, setShowGlobalClearModal] = useState(false);

  // Sync state to localStorage for persistence
  useEffect(() => {
    if (currentRole) {
      localStorage.setItem('pb_active_role', currentRole);
    } else {
      localStorage.removeItem('pb_active_role');
    }
  }, [currentRole]);

  // Try to load cloud data from Supabase on startup
  useEffect(() => {
    let isMounted = true;
    async function loadCloudData() {
      try {
        const [cloudProducts, cloudCustomers, cloudSuppliers, cloudSales, cloudBranches, cloudAccounts] = await Promise.all([
          SupabaseService.fetchProducts(),
          SupabaseService.fetchCustomers(),
          SupabaseService.fetchSuppliers(),
          SupabaseService.fetchSales(),
          SupabaseService.fetchBranches(),
          SupabaseService.fetchUserAccounts(),
        ]);
        if (!isMounted) return;
        if (cloudProducts && cloudProducts.length > 0) setProducts(cloudProducts);
        if (cloudCustomers && cloudCustomers.length > 0) setCustomers(cloudCustomers);
        if (cloudSuppliers && cloudSuppliers.length > 0) setSuppliers(cloudSuppliers);
        if (cloudSales && cloudSales.length > 0) setSales(cloudSales);
        if (cloudBranches && cloudBranches.length > 0) setBranches(cloudBranches);
        if (cloudAccounts && cloudAccounts.length > 0) setUserAccounts(cloudAccounts);
      } catch {
        // Fallback to local data
      }
    }
    loadCloudData();
    return () => {
      isMounted = false;
    };
  }, []);

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

  useEffect(() => {
    localStorage.setItem('pb_branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('pb_active_branch_id', activeBranchId);
  }, [activeBranchId]);

  useEffect(() => {
    localStorage.setItem('pb_transfers', JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem('pb_user_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pb_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pb_current_user');
    }
  }, [currentUser]);

  // Handle Stock Transfers between branches
  const handlePerformTransfer = (transfer: StockTransfer) => {
    setTransfers((prev) => [transfer, ...prev]);

    // 1. Deduct stock from source branch immediately (in transit)
    setProducts((prev) => {
      return prev.map((prod) => {
        if (prod.id === transfer.productId) {
          const currentBranchStocks = prod.branchStocks ? { ...prod.branchStocks } : {};
          const sourceStock = currentBranchStocks[transfer.sourceBranchId] ?? prod.stock;

          // Deduct from source branch
          currentBranchStocks[transfer.sourceBranchId] = Math.max(0, sourceStock - transfer.quantity);

          const updatedProd = {
            ...prod,
            branchStocks: currentBranchStocks,
          };
          SupabaseService.upsertProduct(updatedProd);
          return updatedProd;
        }
        return prod;
      });
    });

    // 2. Sync transfer record to Supabase
    SupabaseService.insertTransfer(transfer);
  };

  // Handle Accept Transfer (Target Branch Gerente or Admin)
  const handleAcceptTransfer = (transferId: string, receivedBy: string) => {
    const targetTransfer = transfers.find((t) => t.id === transferId);
    if (!targetTransfer || targetTransfer.status !== 'En tránsito') return;

    const now = new Date().toISOString();

    // 1. Increment stock in target branch
    setProducts((prev) => {
      return prev.map((prod) => {
        if (prod.id === targetTransfer.productId) {
          const currentBranchStocks = prod.branchStocks ? { ...prod.branchStocks } : {};
          const currentTargetStock = currentBranchStocks[targetTransfer.targetBranchId] ?? 0;

          currentBranchStocks[targetTransfer.targetBranchId] = currentTargetStock + targetTransfer.quantity;

          const updatedProd = {
            ...prod,
            branchStocks: currentBranchStocks,
          };
          SupabaseService.upsertProduct(updatedProd);
          return updatedProd;
        }
        return prod;
      });
    });

    // 2. Mark transfer as Recibido
    setTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? {
              ...t,
              status: 'Recibido',
              receivedBy,
              receivedDate: now,
            }
          : t
      )
    );

    // 3. Sync status with Supabase
    SupabaseService.updateTransferStatus(transferId, 'Recibido', receivedBy, now);
  };

  // Handle Reject Transfer
  const handleRejectTransfer = (transferId: string, reason: string) => {
    const targetTransfer = transfers.find((t) => t.id === transferId);
    if (!targetTransfer || targetTransfer.status !== 'En tránsito') return;

    // 1. Revert stock back to source branch
    setProducts((prev) => {
      return prev.map((prod) => {
        if (prod.id === targetTransfer.productId) {
          const currentBranchStocks = prod.branchStocks ? { ...prod.branchStocks } : {};
          const currentSourceStock = currentBranchStocks[targetTransfer.sourceBranchId] ?? 0;

          currentBranchStocks[targetTransfer.sourceBranchId] = currentSourceStock + targetTransfer.quantity;

          const updatedProd = {
            ...prod,
            branchStocks: currentBranchStocks,
          };
          SupabaseService.upsertProduct(updatedProd);
          return updatedProd;
        }
        return prod;
      });
    });

    // 2. Mark transfer as Rechazado
    setTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? {
              ...t,
              status: 'Rechazado',
              rejectionReason: reason,
            }
          : t
      )
    );

    // 3. Sync status with Supabase
    SupabaseService.updateTransferStatus(transferId, 'Rechazado', undefined, undefined, reason);
  };

  // Handle Role / User Selection
  const handleSelectRole = (role: UserRole, account?: UserAccount) => {
    setCurrentRole(role);
    let matched = account;
    if (!matched) {
      matched = userAccounts.find((a) => a.role === role);
    }
    if (matched) {
      setCurrentUser(matched);
      if (matched.branchId) {
        setActiveBranchId(matched.branchId);
      }
    }
    if (role === 'Pos: ventas') {
      setActiveModule('pos');
    } else if (role === 'Admin') {
      setActiveModule('metrics');
    } else if (role === 'Gerente') {
      setActiveModule('products');
    } else {
      setActiveModule('metrics');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentRole(null);
    setCurrentUser(null);
    localStorage.removeItem('pb_active_role');
    localStorage.removeItem('pb_current_user');
    setActiveReceiptSale(null);
  };

  // User Accounts Handlers
  const handleAddUserAccount = (account: UserAccount) => {
    setUserAccounts((prev) => [account, ...prev]);
    SupabaseService.upsertUserAccount(account);
  };

  const handleUpdateUserAccount = (account: UserAccount) => {
    setUserAccounts((prev) => prev.map((a) => (a.id === account.id ? account : a)));
    if (currentUser?.id === account.id) {
      setCurrentUser(account);
    }
    SupabaseService.upsertUserAccount(account);
  };

  const handleDeleteUserAccount = (accountId: string) => {
    setUserAccounts((prev) => prev.filter((a) => a.id !== accountId));
    SupabaseService.deleteUserAccount(accountId);
  };

  // Handle Sale Completed in POS
  const handleCompleteSale = (newSale: Sale) => {
    // 1. Add to sales history
    setSales((prev) => [newSale, ...prev]);

    // 2. Decrement stock in products (global and branch-specific)
    setProducts((prev) => {
      return prev.map((prod) => {
        const cartItem = newSale.items.find((it) => it.product.id === prod.id);
        if (cartItem) {
          const newStock = Math.max(0, prod.stock - cartItem.quantity);
          const currentBranchStocks = prod.branchStocks ? { ...prod.branchStocks } : {};
          const branchKey = newSale.branchId || activeBranchId;
          const currentBStock = currentBranchStocks[branchKey] ?? prod.stock;
          currentBranchStocks[branchKey] = Math.max(0, currentBStock - cartItem.quantity);

          const updatedProd = {
            ...prod,
            stock: newStock,
            branchStocks: currentBranchStocks,
          };
          SupabaseService.upsertProduct(updatedProd);
          return updatedProd;
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

    // 4. Sync sale with Supabase
    SupabaseService.insertSale(newSale);

    // 5. Show printable receipt modal
    setActiveReceiptSale(newSale);
  };

  // Handle Branch Actions (Admin)
  const handleAddBranch = (newBranch: Branch, initialUsers?: UserAccount[]) => {
    setBranches((prev) => [...prev, newBranch]);
    SupabaseService.upsertBranch(newBranch);
    if (initialUsers && initialUsers.length > 0) {
      setUserAccounts((prev) => [...initialUsers, ...prev]);
      for (const u of initialUsers) {
        SupabaseService.upsertUserAccount(u);
      }
    }
  };

  const handleUpdateBranch = (updated: Branch) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
    SupabaseService.upsertBranch(updated);
  };

  const handleDeleteBranch = (branchId: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== branchId));
    SupabaseService.deleteBranch(branchId);
    if (activeBranchId === branchId) {
      const remaining = branches.find((b) => b.id !== branchId);
      if (remaining) setActiveBranchId(remaining.id);
    }
  };

  const handleToggleBlockBranch = (branchId: string) => {
    setBranches((prev) => {
      const updated = prev.map((b) =>
        b.id === branchId ? { ...b, isActive: !b.isActive } : b
      );
      const target = updated.find((b) => b.id === branchId);
      if (target) SupabaseService.upsertBranch(target);
      return updated;
    });
  };

  // Handle Product Actions
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
    SupabaseService.upsertProduct(newProd);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    SupabaseService.upsertProduct(updated);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    SupabaseService.deleteProduct(productId);
  };

  // Handle Customer Actions
  const handleAddCustomer = (newCust: Customer) => {
    setCustomers((prev) => [newCust, ...prev]);
    SupabaseService.upsertCustomer(newCust);
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    SupabaseService.upsertCustomer(updated);
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    SupabaseService.deleteCustomer(customerId);
  };

  // Handle Supplier Actions
  const handleAddSupplier = (newSup: Supplier) => {
    setSuppliers((prev) => [newSup, ...prev]);
    SupabaseService.upsertSupplier(newSup);
  };

  const handleUpdateSupplier = (updated: Supplier) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
    SupabaseService.upsertSupplier(updated);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
    SupabaseService.deleteSupplier(supplierId);
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
          const newStock = prod.stock + item.quantity;
          const currentBranchStocks = prod.branchStocks ? { ...prod.branchStocks } : {};
          const branchKey = saleToCancel.branchId || activeBranchId;
          const currentBStock = currentBranchStocks[branchKey] ?? prod.stock;
          currentBranchStocks[branchKey] = currentBStock + item.quantity;

          const updated = {
            ...prod,
            stock: newStock,
            branchStocks: currentBranchStocks,
          };
          SupabaseService.upsertProduct(updated);
          return updated;
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

    SupabaseService.updateSaleStatus(saleId, 'Cancelada');
    alert(`Venta ${saleToCancel.folio} cancelada. Inventario restituido con éxito.`);
  };

  // Handle Permanent Sale Deletion (Admin & Gerente)
  const handleDeleteSale = (saleId: string) => {
    setSales((prev) => prev.filter((s) => s.id !== saleId));
    SupabaseService.deleteSale(saleId);
  };

  // Quick Action from Marketplace: Add to POS and navigate
  const handleAddToCartAndGoPOS = (product: Product) => {
    setActiveModule('pos');
  };

  // Handler: Global Clear / Wipe of Test Records
  const handleClearAllTestData = async () => {
    setProducts([]);
    setCustomers([]);
    setSuppliers([]);
    setSales([]);
    setBranches([]);
    setTransfers([]);
    setUserAccounts([]);
    localStorage.setItem('pb_cleared_test_data', 'true');
    localStorage.setItem('pb_products', '[]');
    localStorage.setItem('pb_customers', '[]');
    localStorage.setItem('pb_suppliers', '[]');
    localStorage.setItem('pb_sales', '[]');
    localStorage.setItem('pb_branches', '[]');
    localStorage.setItem('pb_transfers', '[]');
    localStorage.setItem('pb_user_accounts', '[]');
  };

  // Handler: Restore Initial Defaults Demo Data
  const handleRestoreDefaults = async (data: {
    products: Product[];
    customers: Customer[];
    suppliers: Supplier[];
    sales: Sale[];
  }) => {
    setProducts(data.products);
    setCustomers(data.customers);
    setSuppliers(data.suppliers);
    setSales(data.sales);
    setBranches(INITIAL_BRANCHES);
    setTransfers(INITIAL_TRANSFERS);
    setUserAccounts(INITIAL_USER_ACCOUNTS);
    localStorage.removeItem('pb_cleared_test_data');
    localStorage.setItem('pb_products', JSON.stringify(data.products));
    localStorage.setItem('pb_customers', JSON.stringify(data.customers));
    localStorage.setItem('pb_suppliers', JSON.stringify(data.suppliers));
    localStorage.setItem('pb_sales', JSON.stringify(data.sales));
    localStorage.setItem('pb_branches', JSON.stringify(INITIAL_BRANCHES));
    localStorage.setItem('pb_transfers', JSON.stringify(INITIAL_TRANSFERS));
    localStorage.setItem('pb_user_accounts', JSON.stringify(INITIAL_USER_ACCOUNTS));
    await SupabaseService.seedInitialData(
      data.products,
      data.customers,
      data.suppliers,
      data.sales,
      INITIAL_BRANCHES
    );
  };

  // 1. Initial State: Role Selector Screen
  if (!currentRole) {
    return (
      <RoleSelector
        onSelectRole={handleSelectRole}
        userAccounts={userAccounts}
        branches={branches}
      />
    );
  }

  // 2. Main Application Shell
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5F7] text-[#1E293B] antialiased selection:bg-[#E6007E] selection:text-white">
      {/* Unified Institutional Header */}
      <Header
        currentRole={currentRole}
        currentUser={currentUser}
        onLogout={handleLogout}
        branches={branches}
        activeBranchId={activeBranchId}
        onSelectBranch={setActiveBranchId}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        sidebarOpen={!sidebarCollapsed}
        onOpenSupabase={() => setShowSupabaseModal(true)}
        onOpenGlobalClear={() => setShowGlobalClearModal(true)}
        onOpenProfile={() => setActiveModule('profile')}
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
          onOpenSupabase={() => setShowSupabaseModal(true)}
          onOpenGlobalClear={() => setShowGlobalClearModal(true)}
        />

        {/* Central Workspace (Render Active Module) */}
        <main className="flex-1 flex flex-col overflow-hidden pb-16 lg:pb-0 relative">
          {activeModule === 'metrics' && (
            <MetricsModule
              sales={sales}
              products={products}
              customers={customers}
              suppliers={suppliers}
              currentRole={currentRole}
              onReprintSale={(sale) => setActiveReceiptSale(sale)}
            />
          )}

          {activeModule === 'pos' && (
            <POSModule
              products={products}
              customers={customers}
              currentRole={currentRole}
              branches={branches}
              activeBranchId={activeBranchId}
              onSelectBranch={setActiveBranchId}
              onCompleteSale={handleCompleteSale}
            />
          )}

          {activeModule === 'products' && (
            <ProductsModule
              products={products}
              branches={branches}
              activeBranchId={activeBranchId}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onNavigateToTransfers={() => setActiveModule('transfers')}
            />
          )}

          {activeModule === 'transfers' && (
            <TransfersModule
              transfers={transfers}
              branches={branches}
              products={products}
              activeBranchId={activeBranchId}
              currentRole={currentRole}
              currentUser={currentUser}
              onPerformTransfer={handlePerformTransfer}
              onAcceptTransfer={handleAcceptTransfer}
              onRejectTransfer={handleRejectTransfer}
              onNavigateToModule={setActiveModule}
            />
          )}

          {activeModule === 'branches' && (
            <BranchesModule
              branches={branches}
              activeBranchId={activeBranchId}
              userAccounts={userAccounts}
              currentUser={currentUser}
              currentRole={currentRole}
              products={products}
              sales={sales}
              transfers={transfers}
              onSelectBranch={setActiveBranchId}
              onAddBranch={handleAddBranch}
              onUpdateBranch={handleUpdateBranch}
              onDeleteBranch={handleDeleteBranch}
              onToggleBlockBranch={handleToggleBlockBranch}
              onPerformTransfer={handlePerformTransfer}
              onAcceptTransfer={handleAcceptTransfer}
              onRejectTransfer={handleRejectTransfer}
              onAddUserAccount={handleAddUserAccount}
              onUpdateUserAccount={handleUpdateUserAccount}
              onDeleteUserAccount={handleDeleteUserAccount}
              onNavigateToModule={setActiveModule}
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
              branches={branches}
              onReprintSale={(sale) => setActiveReceiptSale(sale)}
              onCancelSale={handleCancelSale}
              onDeleteSale={handleDeleteSale}
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

          {activeModule === 'profile' && (
            <ProfileModule
              currentRole={currentRole}
              currentUser={currentUser}
              sales={sales}
              onLogout={handleLogout}
              onUpdateAccount={handleUpdateUserAccount}
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

      {/* Supabase Connection & Sync Modal */}
      {showSupabaseModal && (
        <SupabaseModal
          onClose={() => setShowSupabaseModal(false)}
          products={products}
          customers={customers}
          suppliers={suppliers}
          sales={sales}
          branches={branches}
          onOpenGlobalClear={() => setShowGlobalClearModal(true)}
          onDataLoadedFromSupabase={({ products: p, customers: c, suppliers: s, sales: sa, branches: b }) => {
            if (p) setProducts(p);
            if (c) setCustomers(c);
            if (s) setSuppliers(s);
            if (sa) setSales(sa);
            if (b) setBranches(b);
          }}
        />
      )}

      {/* Global Clear of Test Records Modal */}
      {showGlobalClearModal && (
        <GlobalClearModal
          isOpen={showGlobalClearModal}
          onClose={() => setShowGlobalClearModal(false)}
          products={products}
          customers={customers}
          suppliers={suppliers}
          sales={sales}
          onClearAll={handleClearAllTestData}
          onRestoreDefaults={handleRestoreDefaults}
        />
      )}
    </div>
  );
}
