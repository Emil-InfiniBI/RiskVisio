import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  getCurrentUser, 
  getUserFactories, 
  switchToFactory, 
  isAdmin,
  User,
  loginUser,
  logoutUser 
} from '@/lib/user-management';
import { CURRENT_FACTORY } from '@/lib/occurrence-options';

interface FactorySwitcherProps {
  onFactoryChange?: (factoryCode: string) => void;
}

export const FactorySwitcher: React.FC<FactorySwitcherProps> = ({ onFactoryChange }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [selectedFactory, setSelectedFactory] = useState<string>(CURRENT_FACTORY);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setSelectedFactory(user.currentFactory || CURRENT_FACTORY);
    }
  }, []);

  const handleFactoryChange = (factoryCode: string) => {
    if (currentUser && switchToFactory(currentUser, factoryCode)) {
      setSelectedFactory(factoryCode);
      onFactoryChange?.(factoryCode);
      
      // Remove page reload - let React handle the state update
      // window.location.reload();
    }
  };

  if (!currentUser) {
    return null;
  }

  const userFactories = getUserFactories(currentUser);
  const currentFactoryName = userFactories.find(f => f.code === selectedFactory)?.name || selectedFactory;

  return (
    <div className="flex items-center gap-4">
      {/* User Info */}
      <div className="flex items-center gap-2">
        <Badge variant={currentUser.role === 'admin' ? 'default' : 'secondary'}>
          {currentUser.role.toUpperCase()}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {currentUser.username}
        </span>
      </div>

      {/* Factory Selector */}
      {userFactories.length > 1 ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Factory:</span>
          <Select value={selectedFactory} onValueChange={handleFactoryChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select factory" />
            </SelectTrigger>
            <SelectContent>
              {userFactories.map((factory) => (
                <SelectItem key={factory.code} value={factory.code}>
                  {factory.code} - {factory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <Badge variant="outline">
          {currentFactoryName}
        </Badge>
      )}

      {/* Admin indicator */}
      {isAdmin(currentUser) && (
        <Badge variant="destructive">
          ALL FACTORIES ACCESS
        </Badge>
      )}
    </div>
  );
};

// Simple login component for demo
interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginForm: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const user = loginUser(username, password);
    if (user) {
      onLoginSuccess(user);
    } else {
      setError('Invalid credentials. Try: admin/demo123, manager_btl/demo123, or user_btg/demo123');
    }
  };

  return (
    <Card className="w-[400px] mx-auto mt-20">
      <CardHeader>
        <CardTitle>Login to Risk Management System</CardTitle>
        <CardDescription>
          Demo accounts: admin, manager_btl, user_btg (password: demo123)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter username"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter password"
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        <Button onClick={handleLogin} className="w-full">
          Login
        </Button>
      </CardContent>
    </Card>
  );
};
