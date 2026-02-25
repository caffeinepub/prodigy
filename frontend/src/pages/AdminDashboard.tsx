import React, { useState } from 'react';
import AdminGuard from '../components/AdminGuard';
import AdminSidebar from '../components/admin/AdminSidebar';
import OverviewSection from '../components/admin/OverviewSection';
import UserManagementSection from '../components/admin/UserManagementSection';
import BookManagementSection from '../components/admin/BookManagementSection';
import SecuritySection from '../components/admin/SecuritySection';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export type AdminSection = 'overview' | 'users' | 'books' | 'security';

function AdminDashboardContent() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
    setMobileOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <OverviewSection />;
      case 'users': return <UserManagementSection />;
      case 'books': return <BookManagementSection />;
      case 'security': return <SecuritySection />;
      default: return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50">
        <AdminSidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-admin-sidebar border-admin-border">
          <AdminSidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-admin-sidebar border-b border-admin-border sticky top-0 z-40">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="text-admin-gold hover:bg-admin-gold/10"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img src="/assets/generated/prodigy-logo.dim_128x128.png" alt="Prodigy" className="h-7 w-7 rounded-full" />
            <span className="font-bold text-admin-gold text-sm">Admin Dashboard</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
