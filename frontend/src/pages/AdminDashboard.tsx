import { useState } from 'react';
import AdminGuard from '../components/AdminGuard';
import AdminSidebar from '../components/admin/AdminSidebar';
import type { AdminSection } from '../components/admin/AdminSidebar';
import OverviewSection from '../components/admin/OverviewSection';
import UserManagementSection from '../components/admin/UserManagementSection';
import BookManagementSection from '../components/admin/BookManagementSection';
import SecuritySection from '../components/admin/SecuritySection';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <OverviewSection />;
      case 'users': return <UserManagementSection />;
      case 'books': return <BookManagementSection />;
      case 'security': return <SecuritySection />;
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-admin-bg flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0">
          <AdminSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 p-4 border-b border-admin-border bg-admin-sidebar">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-admin-text">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-admin-sidebar border-admin-border">
                <AdminSidebar
                  activeSection={activeSection}
                  onSectionChange={(section) => {
                    setActiveSection(section);
                    setMobileOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>
            <h1 className="font-cinzel font-bold text-admin-gold text-lg">Admin Panel</h1>
          </div>

          {/* Section Content */}
          <div className="p-6">
            {renderSection()}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
