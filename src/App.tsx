import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks'; // still used for other modules for now
import { Incident, Risk, ComplianceItem, Investigation, Occurrence, Factory, User, UserRole } from '@/types';
import { Login } from '@/components/Login';
import { UserManagement } from '@/components/UserManagement';
import { Header } from '@/components/Header';
// import { IncidentForm } from '@/components/IncidentForm';
import { RiskForm } from '@/components/RiskForm';
import { ComplianceForm } from '@/components/ComplianceForm';
// import { IncidentList } from '@/components/IncidentList';
import { RiskList } from '@/components/RiskList';
import { ComplianceList } from '@/components/ComplianceList';
import { OccurrenceForm } from '@/components/OccurrenceForm';
import { OccurrenceFormPage } from '@/components/OccurrenceFormPage';
import { OccurrenceList } from '@/components/OccurrenceList';
import { Dashboard } from '@/components/Dashboard';
import { InvestigationForm } from '@/components/InvestigationForm';
import { apiFetch, getApiUrl } from '@/lib/api-config';
import AdminPage from '@/components/AdminPage';
import HelpPage from '@/components/HelpPage';

// Main Risk & Incident Management Application
function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]); // server-backed now
  const [showUserManagement, setShowUserManagement] = useState(false);

  // Initial server load for users & occurrences
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const loadInitialData = async () => {
      try {
        console.log('Loading initial data from server...');
        
        // Add timeout to API calls
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
  const usersRes = await apiFetch('/api/users', { signal: controller.signal });
  const occRes = await apiFetch('/api/occurrences', { signal: controller.signal });
        
        clearTimeout(timeoutId);
        
        if (!usersRes.ok || !occRes.ok) {
          throw new Error(`Server error: Users ${usersRes.status}, Occurrences ${occRes.status}`);
        }
        
        const usersData = await usersRes.json();
        const occData = await occRes.json();
        
        console.log('Loaded users:', usersData.length, 'occurrences:', occData.length);
        
        // Ensure we have default users - create them if missing
        if (Array.isArray(usersData) && usersData.length === 0) {
          console.log('No users found, creating default users...');
          const defaultUsers: User[] = [
            {
              id: 'user_admin',
              username: 'admin',
              password: 'admin',
              role: 'admin' as UserRole,
              fullName: 'System Administrator',
              email: 'admin@riskvisio.com',
              factories: ['BTL', 'BTG', 'BTT'] as Factory[],
              isActive: true,
              createdDate: new Date().toISOString().split('T')[0]
            },
            {
              id: 'user_manager_btl',
              username: 'manager_btl',
              password: 'demo123',
              role: 'user' as UserRole,
              fullName: 'BTL Manager',
              email: 'manager.btl@riskvisio.com',
              factories: ['BTL'] as Factory[],
              isActive: true,
              createdDate: new Date().toISOString().split('T')[0]
            },
            {
              id: 'user_btg',
              username: 'user_btg',
              password: 'demo123',
              role: 'user' as UserRole,
              fullName: 'BTG User',
              email: 'user.btg@riskvisio.com',
              factories: ['BTG'] as Factory[],
              isActive: true,
              createdDate: new Date().toISOString().split('T')[0]
            }
          ];
          
          // Create users one by one to avoid race conditions
          for (const user of defaultUsers) {
            try {
              await apiFetch('/api/users', { 
                method: 'POST', 
                body: JSON.stringify(user) 
              });
              console.log('✓ Created default user:', user.username);
            } catch (err) {
              console.error('Error creating user:', user.username, err);
            }
          }
          
          setUsers(defaultUsers);
        } else {
          setUsers(Array.isArray(usersData) ? usersData : []);
        }
        
        setOccurrences(Array.isArray(occData) ? occData : []);
        console.log('✓ Initial data load complete');
        
      } catch (error) {
        console.error('Failed initial load attempt', retryCount + 1, error);
        
        if (retryCount < maxRetries) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`Retrying in ${delay}ms...`);
          setTimeout(loadInitialData, delay);
        } else {
          console.error('All retry attempts failed, using fallback data');
          // Fallback to default users for offline/failure scenarios
          const fallbackUsers = [
            {
              id: 'user_admin',
              username: 'admin',
              password: 'admin',
              role: 'admin' as UserRole,
              fullName: 'System Administrator',
              email: 'admin@riskvisio.com',
              factories: ['BTL', 'BTG', 'BTT'] as Factory[],
              isActive: true,
              createdDate: new Date().toISOString().split('T')[0]
            }
          ];
          setUsers(fallbackUsers);
          setOccurrences([]);
        }
      }
    };
    
    loadInitialData();
  }, []);

  // App data
  const [incidents, setIncidents] = useLocalStorage<Incident[]>('incidents', []);
  const [risks, setRisks] = useLocalStorage<Risk[]>('risks', []);
  const [compliance, setCompliance] = useLocalStorage<ComplianceItem[]>('compliance', []);
  const [investigations, setInvestigations] = useLocalStorage<Investigation[]>('investigations', []);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]); // server-backed
  
  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAdminPage, setShowAdminPage] = useState(false);
  // const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showRiskForm, setShowRiskForm] = useState(false);
  const [showComplianceForm, setShowComplianceForm] = useState(false);
  const [showInvestigationForm, setShowInvestigationForm] = useState(false);
  const [showOccurrenceForm, setShowOccurrenceForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingOccurrence, setViewingOccurrence] = useState<Occurrence | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFactory, setSelectedFactory] = useState<Factory | 'ALL'>('ALL');
  const [occurrenceDirty, setOccurrenceDirty] = useState(false); // track unsaved changes in occurrence form
  const [pendingTab, setPendingTab] = useState<string | null>(null); // store intended tab while confirming
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const factories: Factory[] = ['BTL', 'BTO', 'BTI', 'BTX', 'BTT', 'BTG'];

  // Authentication handlers
  const handleLogin = (user: User) => {
    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    setUsers((current = []) => current.map(u => u.id === user.id ? updatedUser : u));
  apiFetch('/api/users', { method: 'POST', body: JSON.stringify(updatedUser) }).catch(()=>{});
    setCurrentUser(updatedUser);
    
    // Set default factory for non-admin users
    if (user.role !== 'admin' && user.factories.length > 0) {
      setSelectedFactory(user.factories[0]);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedFactory('ALL');
    setActiveTab('dashboard');
    setShowUserManagement(false);
  };

  // Factory change handler with permission enforcement
  const handleFactoryChange = (factory: Factory | 'ALL') => {
    if (!currentUser) return;
    
    // Only admin can access ALL factories
    if (factory === 'ALL' && currentUser.role !== 'admin') {
      return;
    }
    
    // For non-admin users, ensure they can only access their assigned factories
    if (currentUser.role !== 'admin' && factory !== 'ALL') {
      if (!currentUser.factories.includes(factory)) {
        return;
      }
    }
    
    setSelectedFactory(factory);
  };

  // User management handlers
  const handleAddUser = (user: User) => {
    setUsers((current = []) => [...current, user]);
  apiFetch('/api/users', { method: 'POST', body: JSON.stringify(user) }).catch(()=>{});
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers((current = []) => current.map(user => user.id === updatedUser.id ? updatedUser : user));
  apiFetch('/api/users', { method: 'POST', body: JSON.stringify(updatedUser) }).catch(()=>{});
  };

  const handleDeleteUser = (id: string) => {
    setUsers((current = []) => current.filter(user => user.id !== id));
  apiFetch(`/api/users/${id}`, { method: 'DELETE' }).catch(()=>{});
  };

  // Permission checks
  const canEdit = currentUser?.role === 'admin';
  const canDelete = currentUser?.role === 'admin';
  
  // If not logged in, show login screen
  if (!currentUser) {
    return <Login users={users || []} onLogin={handleLogin} />;
  }

  // If showing user management
  if (showUserManagement && currentUser?.role === 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Header
          currentUser={currentUser}
          selectedFactory={selectedFactory}
          onFactoryChange={handleFactoryChange}
          onLogout={handleLogout}
          onShowUserManagement={() => setShowUserManagement(false)}
        />
        <div className="container mx-auto px-6 py-6">
          <UserManagement
            users={users || []}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        </div>
      </div>
    );
  }
  
  // Filter data by selected factory and user permissions
  const getFilteredIncidents = () => {
    let filtered = incidents || [];
    
    // Apply factory filter
    if (selectedFactory !== 'ALL') {
      filtered = filtered.filter(incident => incident.factory === selectedFactory);
    }
    
    // Apply user permissions
    if (currentUser && currentUser.role !== 'admin') {
      filtered = filtered.filter(incident => currentUser.factories.includes(incident.factory));
    }
    
    return filtered;
  };
  
  const getFilteredRisks = () => {
    let filtered = risks || [];
    
    if (selectedFactory !== 'ALL') {
      filtered = filtered.filter(risk => risk.factory === selectedFactory);
    }
    
    if (currentUser && currentUser.role !== 'admin') {
      filtered = filtered.filter(risk => currentUser.factories.includes(risk.factory));
    }
    
    return filtered;
  };
  
  const getFilteredCompliance = () => {
    let filtered = compliance || [];
    
    if (selectedFactory !== 'ALL') {
      filtered = filtered.filter(item => item.factory === selectedFactory);
    }
    
    if (currentUser && currentUser.role !== 'admin') {
      filtered = filtered.filter(item => currentUser.factories.includes(item.factory));
    }
    
    return filtered;
  };
  
  const getFilteredInvestigations = () => {
    let filtered = investigations || [];
    
    if (selectedFactory !== 'ALL') {
      filtered = filtered.filter(investigation => investigation.factory === selectedFactory);
    }
    
    if (currentUser && currentUser.role !== 'admin') {
      filtered = filtered.filter(investigation => currentUser.factories.includes(investigation.factory));
    }
    
    return filtered;
  };

  const getFilteredOccurrences = () => {
    let filtered = occurrences || [];
    
    if (selectedFactory !== 'ALL') {
      filtered = filtered.filter(occurrence => occurrence.factory === selectedFactory);
    }
    
    if (currentUser && currentUser.role !== 'admin') {
      filtered = filtered.filter(occurrence => currentUser.factories.includes(occurrence.factory));
    }
    
    return filtered;
  };

  const filteredIncidents = getFilteredIncidents();
  const filteredRisks = getFilteredRisks();
  const filteredCompliance = getFilteredCompliance();
  const filteredInvestigations = getFilteredInvestigations();
  const filteredOccurrences = getFilteredOccurrences();

  // Incident handlers removed (incidents will be managed via occurrences)

  const handleAddRisk = (risk: Risk) => {
    setRisks((current = []) => [...current, risk]);
    setShowRiskForm(false);
  };

  const handleUpdateRisk = (updatedRisk: Risk) => {
    setRisks((current = []) => 
      current.map(risk => 
        risk.id === updatedRisk.id ? updatedRisk : risk
      )
    );
    setEditingItem(null);
  };

  const handleDeleteRisk = (id: string) => {
    setRisks((current = []) => current.filter(risk => risk.id !== id));
  };

  const handleAddCompliance = (complianceItem: ComplianceItem) => {
    setCompliance((current = []) => [...current, complianceItem]);
    setShowComplianceForm(false);
  };

  const handleUpdateCompliance = (updatedCompliance: ComplianceItem) => {
    setCompliance((current = []) => 
      current.map(item => 
        item.id === updatedCompliance.id ? updatedCompliance : item
      )
    );
    setEditingItem(null);
  };

  const handleDeleteCompliance = (id: string) => {
    setCompliance((current = []) => current.filter(item => item.id !== id));
  };

  const handleAddInvestigation = (investigation: Investigation) => {
    setInvestigations((current = []) => [...current, investigation]);
    setShowInvestigationForm(false);
  };

  const handleAddOccurrence = (occurrence: Occurrence) => {
    setOccurrences((current = []) => [occurrence, ...current]);
  apiFetch('/api/occurrences', { method: 'POST', body: JSON.stringify(occurrence) })
      .catch(()=>{})
      .finally(() => setShowOccurrenceForm(false));
  };

  const handleUpdateOccurrence = (updatedOccurrence: Occurrence) => {
    setOccurrences((current = []) => 
      current.map(occurrence => 
        occurrence.id === updatedOccurrence.id ? updatedOccurrence : occurrence
      )
    );
  apiFetch('/api/occurrences', { method: 'POST', body: JSON.stringify(updatedOccurrence) }).catch(()=>{});
    setEditingItem(null);
  };

  const handleDeleteOccurrence = (id: string) => {
    setOccurrences((current = []) => current.filter(occurrence => occurrence.id !== id));
    // TODO: implement backend delete endpoint
  };

  // const openIncidentForInvestigation = (incident: Incident) => {
  //   setEditingItem(incident);
  //   setShowInvestigationForm(true);
  // };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive';
      case 'high': return 'bg-accent';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': case 'resolved': case 'closed': return 'bg-green-500';
      case 'non-compliant': case 'reported': return 'bg-destructive';
      case 'partial': case 'investigating': case 'in-progress': return 'bg-yellow-500';
      case 'under-review': case 'assessed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const criticalIncidents = filteredIncidents.filter(i => i.severity === 'critical').length;
  const highRisks = filteredRisks.filter(r => r.riskScore >= 15).length;
  const overdueTasks = filteredCompliance.filter(c => new Date(c.dueDate) < new Date() && c.status !== 'compliant').length;
  const activeInvestigations = filteredInvestigations.filter(inv => inv.status !== 'completed').length;
  const recentOccurrences = filteredOccurrences.filter(o => {
    const reportedDate = new Date(o.reportedDate);
    const now = new Date();
    const daysDiff = (now.getTime() - reportedDate.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 7;
  }).length;

  return (
    <div className="min-h-screen bg-background" style={{ 
      width: '100vw', 
      maxWidth: '100%', 
      overflowX: 'hidden',
      position: 'relative'
    }}>
      <Header
        currentUser={currentUser}
        selectedFactory={selectedFactory}
        onFactoryChange={handleFactoryChange}
        onLogout={handleLogout}
        onShowUserManagement={currentUser?.role === 'admin' ? () => setShowUserManagement(true) : undefined}
      />

      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={(val) => {
          // If an occurrence form (new or edit) is open, always confirm before leaving
          if (showOccurrenceForm || (editingItem && editingItem.type && typeof editingItem.reportedDate === 'string')) {
            if (val !== activeTab) {
              setPendingTab(val);
              setShowUnsavedDialog(true);
              return; // block immediate switch
            }
          }
          setActiveTab(val);
        }} className="space-y-4">
          <TabsList className="flex w-full flex-wrap gap-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="occurrences">Occurrences</TabsTrigger>
            <TabsTrigger value="risks">Risk Register</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="investigations">Investigations</TabsTrigger>
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="admin">Admin</TabsTrigger>
            )}
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Critical Incidents</p>
                    <p className="text-2xl font-bold text-destructive">{criticalIncidents}</p>
                  </div>
                  <span className="text-2xl">⚠️</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">High Risks</p>
                    <p className="text-2xl font-bold text-accent">{highRisks}</p>
                  </div>
                  <span className="text-2xl">🛡️</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overdue Tasks</p>
                    <p className="text-2xl font-bold text-destructive">{overdueTasks}</p>
                  </div>
                  <span className="text-2xl">📄</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Investigations</p>
                    <p className="text-2xl font-bold text-primary">{activeInvestigations}</p>
                  </div>
                  <span className="text-2xl">📊</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recent Occurrences</p>
                    <p className="text-2xl font-bold text-primary">{recentOccurrences}</p>
                  </div>
                  <span className="text-2xl">📝</span>
                </div>
              </CardContent>
            </Card>
          </div>
          )}

          <TabsContent value="dashboard">
            <Dashboard 
              incidents={filteredIncidents} 
              risks={filteredRisks} 
              compliance={filteredCompliance}
              investigations={filteredInvestigations}
              occurrences={filteredOccurrences}
            />
          </TabsContent>

          <TabsContent value="occurrences" className="space-y-4">
            {!(showOccurrenceForm || (editingItem && editingItem.type && typeof editingItem.reportedDate === 'string') || viewingOccurrence) && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Occurrence Management</h2>
                  <Button 
                    onClick={() => setShowOccurrenceForm(true)}
                    disabled={!canEdit && (!currentUser || currentUser.factories.length === 0)}
                  >
                    <span className="mr-2">+</span>
                    Report Occurrence
                  </Button>
                </div>
                <OccurrenceList 
                  occurrences={filteredOccurrences.filter(occurrence => 
                    searchTerm === '' || 
                    occurrence.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    occurrence.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )}
                  onEdit={canEdit ? setEditingItem : undefined}
                  onDelete={canDelete ? handleDeleteOccurrence : undefined}
                  onView={(occ) => setViewingOccurrence(occ)}
                  getPriorityColor={(priority) => {
                    switch (priority) {
                      case 'critical': return 'bg-destructive';
                      case 'high': return 'bg-accent';
                      case 'medium': return 'bg-yellow-500';
                      case 'low': return 'bg-green-500';
                      default: return 'bg-gray-500';
                    }
                  }}
                  getStatusColor={getStatusColor}
                />
              </>
            )}
          </TabsContent>

          {/* Incidents tab removed: incidents are covered by occurrences */}

          <TabsContent value="risks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Register</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                We’re polishing this module. It will be available in a future update.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                This module is under construction and will arrive soon.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investigations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Investigations</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                Investigations will be available in an upcoming release.
              </CardContent>
            </Card>
          </TabsContent>

          {currentUser?.role === 'admin' && (
            <TabsContent value="admin">
              <AdminPage onBack={() => setActiveTab('dashboard')} />
            </TabsContent>
          )}

          <TabsContent value="help">
            <HelpPage />
          </TabsContent>
        </Tabs>
      </div>

  {/* Incident forms removed */}

      {showRiskForm && (
        <RiskForm 
          onSubmit={handleAddRisk}
          onClose={() => setShowRiskForm(false)}
          currentUser={currentUser}
          currentFactory={selectedFactory !== 'ALL' ? selectedFactory as Factory : undefined}
        />
      )}

      {editingItem && editingItem.category !== undefined && canEdit && (
        <RiskForm 
          risk={editingItem}
          onSubmit={handleUpdateRisk}
          onClose={() => setEditingItem(null)}
          currentUser={currentUser}
          currentFactory={selectedFactory !== 'ALL' ? selectedFactory as Factory : undefined}
        />
      )}

      {showComplianceForm && (
        <ComplianceForm 
          onSubmit={handleAddCompliance}
          onClose={() => setShowComplianceForm(false)}
          currentUser={currentUser}
          currentFactory={selectedFactory !== 'ALL' ? selectedFactory as Factory : undefined}
        />
      )}

      {editingItem && editingItem.requirement !== undefined && canEdit && (
        <ComplianceForm 
          compliance={editingItem}
          onSubmit={handleUpdateCompliance}
          onClose={() => setEditingItem(null)}
          currentUser={currentUser}
          currentFactory={selectedFactory !== 'ALL' ? selectedFactory as Factory : undefined}
        />
      )}

      {showInvestigationForm && (
        <InvestigationForm 
          incidents={filteredIncidents}
          incident={editingItem?.type !== undefined ? editingItem : undefined}
          onSubmit={handleAddInvestigation}
          onClose={() => {
            setShowInvestigationForm(false);
            setEditingItem(null);
          }}
        />
      )}

    {showOccurrenceForm && (
        <OccurrenceFormPage
          onSubmit={handleAddOccurrence}
          onCancel={() => setShowOccurrenceForm(false)}
          currentFactory={selectedFactory !== 'ALL' ? selectedFactory as Factory : 'BTT'}
          currentUser={currentUser}
      onDirtyChange={setOccurrenceDirty}
        />
      )}

    {editingItem && editingItem.type && typeof editingItem.reportedDate === 'string' && canEdit && (
        <OccurrenceFormPage
          occurrence={editingItem}
          onSubmit={handleUpdateOccurrence}
          onCancel={() => setEditingItem(null)}
          currentFactory={selectedFactory !== 'ALL' ? selectedFactory as Factory : 'BTT'}
          currentUser={currentUser}
      onDirtyChange={setOccurrenceDirty}
        />
      )}

      {viewingOccurrence && (
        <OccurrenceFormPage
          occurrence={viewingOccurrence}
          onSubmit={() => setViewingOccurrence(null)}
          onCancel={() => setViewingOccurrence(null)}
          currentFactory={selectedFactory !== 'ALL' ? selectedFactory as Factory : 'BTT'}
          currentUser={currentUser}
          readOnly
        />
      )}

      {/* Unsaved changes confirmation dialog */}
      {showUnsavedDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-md shadow-lg max-w-sm w-full p-6 space-y-4">
            <h2 className="text-lg font-semibold">Unsaved changes</h2>
            <p className="text-sm text-muted-foreground">You have an occurrence with unsaved changes. If you leave, your changes will be lost.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowUnsavedDialog(false); setPendingTab(null); }}>Stay</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => {
                setShowUnsavedDialog(false);
                setOccurrenceDirty(false);
                setShowOccurrenceForm(false);
                setEditingItem(null);
                if (pendingTab) {
                  setActiveTab(pendingTab);
                  setPendingTab(null);
                }
              }}>Leave without saving</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;