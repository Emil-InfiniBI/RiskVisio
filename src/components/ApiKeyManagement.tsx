import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ApiKey } from '@/types';
import { generateId } from '@/lib/id';

interface ApiKeyManagementProps {
  currentUser: string;
}

export default function ApiKeyManagement({ currentUser }: ApiKeyManagementProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyAccess, setNewKeyAccess] = useState<'full' | 'limited'>('limited');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKey | null>(null);
  const [showSecretDialog, setShowSecretDialog] = useState(false);

  // Load API keys from backend
  const loadKeys = async () => {
    try {
      const res = await fetch('/api/api-keys');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setApiKeys(Array.isArray(data) ? data : []);
    } catch (_) {
      // fallback: keep empty
    }
  };
  useEffect(() => { loadKeys(); }, []);

  // Generate a random string for client ID and secret
  const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Create new API key
  const createApiKey = () => {
    if (!newKeyName.trim()) return;

    const clientId = `key_${generateRandomString(16)}`;
    const clientSecret = `secret_${generateRandomString(32)}`;

    const newKey: ApiKey = {
      id: generateId(),
      clientId,
      clientSecret,
      name: newKeyName.trim(),
      enabled: true,
      accessType: newKeyAccess,
      createdDate: new Date().toISOString(),
      createdBy: currentUser,
    };

    // Call backend
    fetch('/api/api-keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newKeyName.trim(), accessType: newKeyAccess, createdBy: currentUser }) })
      .then(async r => {
        if (!r.ok) throw new Error('create failed');
        const created = await r.json();
        setNewlyCreatedKey(created);
        setShowSecretDialog(true);
        setShowCreateDialog(false);
        setNewKeyName('');
        setNewKeyAccess('limited');
        loadKeys();
      })
      .catch(()=>{});
  };

  // Revoke API key
  const revokeApiKey = (keyId: string) => {
    fetch(`/api/api-keys/${keyId}/revoke`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revokedBy: currentUser }) })
      .then(()=> loadKeys())
      .catch(()=>{});
  };

  // Toggle API key status
  const toggleApiKeyStatus = (keyId: string) => {
    // Revoke or (future) re-enable; currently only revoke endpoint implemented
    if (apiKeys.find(k => k.id === keyId)?.enabled) {
      revokeApiKey(keyId);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage API keys for external integrations and Power BI connections
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>Create API Key</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Generate a new API key for external access. The client secret will only be shown once.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Power BI Integration"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="accessType">Access Type</Label>
                  <Select value={newKeyAccess} onValueChange={(value: 'full' | 'limited') => setNewKeyAccess(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="limited">Limited access</SelectItem>
                      <SelectItem value="full">Full access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="limitedAccess" checked={newKeyAccess === 'limited'} />
                  <Label htmlFor="limitedAccess" className="text-sm text-muted-foreground">
                    Limited access (read-only data for reporting)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createApiKey} disabled={!newKeyName.trim()}>
                  Create Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No API keys created yet.</p>
            <p className="text-sm">Create your first API key to enable external integrations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4 space-y-2">
              <p>All created API keys are shown in the list below. The Client Secret will not appear again after you generate an API key.</p>
              <p>To call the API you must now send BOTH headers: <code className="bg-muted px-1 py-0.5 rounded">x-client-id</code> and <code className="bg-muted px-1 py-0.5 rounded">x-client-secret</code>. (Legacy <code className="bg-muted px-1 py-0.5 rounded">x-api-key</code> alone is no longer sufficient once a secret is enforced.)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Client ID</th>
                    <th className="text-left p-2 font-medium">Name</th>
                    <th className="text-left p-2 font-medium">Enabled</th>
                    <th className="text-left p-2 font-medium">Created</th>
                    <th className="text-left p-2 font-medium">Created by</th>
                    <th className="text-left p-2 font-medium">Client Type</th>
                    <th className="text-left p-2 font-medium">Revoked</th>
                    <th className="text-left p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {key.clientId}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(key.clientId)}
                            className="h-6 w-6 p-0"
                          >
                            📋
                          </Button>
                        </div>
                      </td>
                      <td className="p-2">{key.name}</td>
                      <td className="p-2">
                        <Badge variant={key.enabled ? "default" : "secondary"}>
                          {key.enabled ? "True" : "False"}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm">{formatDate(key.createdDate)}</td>
                      <td className="p-2 text-sm">{key.createdBy}</td>
                      <td className="p-2">
                        <Badge variant={key.accessType === 'full' ? "default" : "outline"}>
                          {key.accessType === 'full' ? 'Full access' : 'Limited access'}
                        </Badge>
                      </td>
                      <td className="p-2 text-sm">
                        {key.revokedDate ? formatDate(key.revokedDate) : '-'}
                      </td>
                      <td className="p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeApiKey(key.id)}
                          disabled={!key.enabled}
                        >
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>

      {/* Secret Display Dialog */}
      <Dialog open={showSecretDialog} onOpenChange={setShowSecretDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created Successfully</DialogTitle>
            <DialogDescription>
              Save these credentials securely. The Client Secret will not be shown again.
            </DialogDescription>
          </DialogHeader>
          {newlyCreatedKey && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Be careful with your API keys and never share them with other people. If you suspect that the key has fallen into the wrong hands, immediately revoke your key and generate a new one.
                </AlertDescription>
              </Alert>
              <div>
                <Label>Client ID</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="flex-1 bg-muted p-2 rounded text-sm">
                    {newlyCreatedKey.clientId}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newlyCreatedKey.clientId)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div>
                <Label>Client Secret</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="flex-1 bg-muted p-2 rounded text-sm">
                    {newlyCreatedKey.clientSecret}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newlyCreatedKey.clientSecret || '')}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                The information in the Client Secret is only displayed when you create the API key, after that it is no longer displayed. It is therefore important that you save the information when creating the key, as the Client Secret corresponds to the password in the API key.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => {
              setShowSecretDialog(false);
              setNewlyCreatedKey(null);
            }}>
              I've saved the credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
