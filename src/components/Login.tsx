import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Lock, User } from 'lucide-react';
import { User as UserType } from '@/types';
import { ConnectionStatus } from './ConnectionStatus';

interface LoginProps {
  users: UserType[];
  onLogin: (user: UserType) => void;
}

export function Login({ users, onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // First check if users are loaded
      if (!users || users.length === 0) {
        console.log('No users available, waiting for server...');
        setError('System is starting up, please wait a moment and try again.');
        setIsLoading(false);
        return;
      }

      const user = users.find(u => u.username === username && u.password === password && u.isActive);
      
      if (user) {
        console.log('Login successful for user:', user.username);
        onLogin(user);
      } else {
        // Check if the username exists but password is wrong
        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
          setError('Invalid password. Please try again.');
        } else {
          setError('Invalid username or password. Use: admin/admin, manager_btl/demo123, or user_btg/demo123');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/assets/riskvisio-logo.png" 
              alt="RiskVisio Logo" 
              className="h-24 sm:h-32 w-auto max-w-xs"
              onError={(e) => {
                // Fallback to Shield icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement?.insertAdjacentHTML('afterbegin', '<div class="h-12 w-12 text-primary"><svg class="w-full h-full" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg></div>');
              }}
            />
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm font-bold">🧪 DEMO</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
            Enter your credentials to access the Risk Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Connection Status */}
          <div className="mb-4 pb-4 border-b border-border">
            <div className="flex justify-center">
              <ConnectionStatus onRetry={() => window.location.reload()} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}