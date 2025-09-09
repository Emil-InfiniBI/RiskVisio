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

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🛡️</span>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  RiskVisio
                  {selectedFactory !== 'ALL' && (
                    <span className="text-lg font-medium text-muted-foreground ml-2">
                      - Factory {selectedFactory}
                    </span>
                  )}
                </h1>
                <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1 text-sm">
                  🧪 DEMO
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Unified Risk • Incident • Near Miss Platform
                {selectedFactory === 'ALL' ? ' - All Factories' : ` - ${selectedFactory} Operations`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Factory selector with user permission enforcement */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">Factory:</span>
              <Select value={selectedFactory} onValueChange={onFactoryChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select factory" />
                </SelectTrigger>
                <SelectContent>
                  {currentUser.role === 'admin' && (
                    <SelectItem value="ALL">
                      <Badge variant="outline">ALL FACTORIES ACCESS</Badge>
                    </SelectItem>
                  )}
                  {availableFactories.map((factory) => (
                    <SelectItem key={factory} value={factory}>
                      {factory} - {factory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-3 pl-4 border-l">
              <div className="flex items-center space-x-2">
                <span className="text-sm">👤</span>
                <span className="text-sm font-medium">{currentUser.fullName}</span>
                <Badge variant={currentUser.role === 'admin' ? 'default' : 'secondary'}>
                  {currentUser.role}
                </Badge>
              </div>

              {currentUser.role === 'admin' && onShowUserManagement && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onShowUserManagement}
                >
                                    ⚙️ User Management
                </Button>
              )}

              <Button 
                variant="outline" 
                size="sm"
                onClick={onLogout}
              >
                <span className="mr-1">🚪</span>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}