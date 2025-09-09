import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { User as UserType, Factory, UserRole } from '@/types';

interface UserManagementProps {
  users: UserType[];
  onAddUser: (user: UserType) => void;
  onUpdateUser: (user: UserType) => void;
  onDeleteUser: (id: string) => void;
}

export function UserManagement({ users, onAddUser, onUpdateUser, onDeleteUser }: UserManagementProps) {
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'user' as UserRole,
    factories: [] as Factory[]
  });

  const factories: Factory[] = ['BTL', 'BTO', 'BTI', 'BTX', 'BTT', 'BTG'];

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      role: 'user',
      factories: []
    });
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      const updatedUser: UserType = {
        ...editingUser,
        ...formData,
        factories: formData.role === 'admin' ? factories : formData.factories
      };
      onUpdateUser(updatedUser);
    } else {
      const newUser: UserType = {
        id: Date.now().toString(),
        ...formData,
        factories: formData.role === 'admin' ? factories : formData.factories,
        isActive: true,
        createdDate: new Date().toISOString().split('T')[0]
      };
      onAddUser(newUser);
    }
    
    setShowUserForm(false);
    resetForm();
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      factories: user.factories
    });
    setShowUserForm(true);
  };

  const handleFactoryToggle = (factory: Factory, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        factories: [...prev.factories, factory]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        factories: prev.factories.filter(f => f !== factory)
      }));
    }
  };

  const toggleUserStatus = (user: UserType) => {
    onUpdateUser({
      ...user,
      isActive: !user.isActive
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Dialog open={showUserForm} onOpenChange={(open) => {
          setShowUserForm(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <span className="mr-2">+</span>
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user details and permissions' : 'Create a new user account'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as UserRole }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role !== 'admin' && (
                <div className="space-y-2">
                  <Label>Factory Access</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {factories.map(factory => (
                      <div key={factory} className="flex items-center space-x-2">
                        <Checkbox
                          id={factory}
                          checked={formData.factories.includes(factory)}
                          onCheckedChange={(checked) => 
                            handleFactoryToggle(factory, checked as boolean)
                          }
                        />
                        <Label htmlFor={factory} className="text-sm">{factory}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowUserForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUser ? 'Update' : 'Create'} User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    {user.role === 'admin' ? (
                      <span className="text-primary">🛡️</span>
                    ) : (
                      <span className="text-muted-foreground">👤</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{user.fullName}</h3>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.isActive ? 'default' : 'destructive'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">@{user.username} • {user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Factories: {user.role === 'admin' ? 'All' : user.factories.join(', ') || 'None'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleUserStatus(user)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <span>✏️</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteUser(user.id)}
                    disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
                  >
                    <span>🗑️</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}