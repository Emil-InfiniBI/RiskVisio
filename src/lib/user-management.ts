// User authentication and factory access management
import { FACTORY_OPTIONS, setCurrentFactory } from './occurrence-options';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  factoryAccess: string[]; // Array of factory codes the user can access
  currentFactory?: string; // Currently selected factory
}

export interface FactoryAccess {
  [userId: string]: string[]; // User ID mapped to factory codes
}

// Mock users for demo (in production this would come from a database/API)
export const MOCK_USERS: User[] = [
  {
    id: 'admin1',
    username: 'admin',
    email: 'admin@baettr.com',
    role: 'admin',
    factoryAccess: ['BTL', 'BTO', 'BTI', 'BTX', 'BTT', 'BTG'], // Admin has access to all
    currentFactory: 'BTG'
  },
  {
    id: 'manager1',
    username: 'manager_btl',
    email: 'manager@btl.com',
    role: 'manager',
    factoryAccess: ['BTL', 'BTO'], // Manager has access to specific factories
    currentFactory: 'BTL'
  },
  {
    id: 'user1',
    username: 'user_btg',
    email: 'user@btg.com',
    role: 'user',
    factoryAccess: ['BTG'], // Regular user has access to one factory
    currentFactory: 'BTG'
  }
];

// Current logged-in user (in production this would be managed by auth system)
let currentUser: User | null = null; // Start with no user logged in

// User management functions
export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const setCurrentUser = (user: User) => {
  currentUser = user;
  // Also set their current factory
  if (user.currentFactory && user.factoryAccess.includes(user.currentFactory)) {
    setCurrentFactory(user.currentFactory);
  } else if (user.factoryAccess.length > 0) {
    setCurrentFactory(user.factoryAccess[0]);
  }
};

export const loginUser = (username: string, password: string): User | null => {
  // Mock authentication (in production this would be real auth)
  const user = MOCK_USERS.find(u => u.username === username);
  if (user && password === 'demo123') { // Simple demo password
    setCurrentUser(user);
    return user;
  }
  return null;
};

export const logoutUser = () => {
  currentUser = null;
};

// Factory access functions
export const getUserFactories = (user: User): Array<{code: string; name: string}> => {
  return FACTORY_OPTIONS.filter(factory => user.factoryAccess.includes(factory.code));
};

export const canUserAccessFactory = (user: User, factoryCode: string): boolean => {
  return user.factoryAccess.includes(factoryCode);
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

export const isManagerOrAdmin = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'manager';
};

// Enhanced factory switching with access control
export const switchToFactory = (user: User, factoryCode: string): boolean => {
  if (canUserAccessFactory(user, factoryCode)) {
    setCurrentFactory(factoryCode);
    
    // Update user's current factory
    user.currentFactory = factoryCode;
    
    // Save to localStorage
    localStorage.setItem('baettr-risk-management-current-user', JSON.stringify(user));
    
    return true;
  }
  return false;
};

// Load user from localStorage on app start
export const loadUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem('baettr-risk-management-current-user');
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      return user;
    }
  } catch (e) {
    console.warn('Failed to load user from storage');
  }
  return null;
};

// Initialize user on module load
if (typeof window !== 'undefined') {
  loadUserFromStorage();
}
