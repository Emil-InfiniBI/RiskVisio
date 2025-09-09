import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User as UserType, Factory } from '@/types';

interface HeaderProps {
  currentUser: UserType;
  selectedFactory: Factory | 'ALL';
  onFactoryChange: (factory: Factory | 'ALL') => void;
  onLogout: () => void;
  onShowUserManagement?: () => void;
}

export function Header({ 
  currentUser, 
  selectedFactory, 
  onFactoryChange, 
  onLogout,
  onShowUserManagement 
}: HeaderProps) {
  const factories: Factory[] = ['BTL', 'BTO', 'BTI', 'BTX', 'BTT', 'BTG'];
  
  // Filter factories based on user permissions
  const availableFactories = currentUser.role === 'admin' 
    ? factories 
    : currentUser.factories;

  // Mobile menu toggle (small screens)
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        {/* Top row */}
        <div className="flex items-start md:items-center justify-between gap-4 flex-wrap">
          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-[220px]">
            <span className="text-2xl sm:text-3xl">🛡️</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight truncate max-w-[180px] sm:max-w-none">
                  RiskVisio
                  {selectedFactory !== 'ALL' && (
                    <span className="hidden sm:inline text-lg font-medium text-muted-foreground ml-2">
                      - {selectedFactory}
                    </span>
                  )}
                </h1>
                <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-2 sm:px-3 py-0.5 text-xs sm:text-sm">
                  DEMO
                </Badge>
              </div>
              <p className="hidden sm:block text-sm text-muted-foreground">
                Unified Risk • Incident • Near Miss Platform {selectedFactory === 'ALL' ? ' - All Factories' : ` - ${selectedFactory}`}
              </p>
            </div>
            {/* Mobile menu button */}
            <Button
              variant="outline"
              size="sm"
              className="md:hidden ml-auto"
              onClick={() => setMenuOpen(o => !o)}
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
            >
              {menuOpen ? '✖' : '☰'}
            </Button>
          </div>

          {/* Right cluster (wraps on mobile) */}
          <div className={(menuOpen ? 'flex' : 'hidden') + ' w-full md:w-auto md:flex flex-col md:flex-row gap-4 md:items-center md:justify-end'}>
            {/* Factory selector with user permission enforcement */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Factory:</span>
              <Select value={selectedFactory} onValueChange={onFactoryChange}>
                <SelectTrigger className="w-[140px] sm:w-[170px] lg:w-[190px] text-xs sm:text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {currentUser.role === 'admin' && (
                    <SelectItem value="ALL">
                      <Badge variant="outline" className="text-[10px] sm:text-xs">ALL FACTORIES</Badge>
                    </SelectItem>
                  )}
                  {availableFactories.map((factory) => (
                    <SelectItem key={factory} value={factory} className="text-xs sm:text-sm">
                      {factory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-2 sm:gap-0 sm:pl-4 sm:border-l">
              <div className="flex items-center gap-2">
                <span className="text-sm">👤</span>
                <span className="text-sm font-medium truncate max-w-[140px]">{currentUser.fullName}</span>
                <Badge variant={currentUser.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs px-2 py-0.5">
                  {currentUser.role}
                </Badge>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {currentUser.role === 'admin' && onShowUserManagement && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onShowUserManagement}
                    className="text-xs"
                  >
                    ⚙️ Users
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onLogout}
                  className="text-xs"
                >
                  🚪 Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}