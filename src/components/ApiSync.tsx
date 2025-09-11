import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ApiSyncProps {
  currentUser: string;
}

export default function ApiSync({ currentUser }: ApiSyncProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  const syncDataToAPI = async () => {
    setSyncing(true);
    setSyncStatus('idle');
    setSyncMessage('');

    try {
      // Get data from localStorage
      const occurrences = JSON.parse(localStorage.getItem('occurrences') || '[]');
      const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
      const risks = JSON.parse(localStorage.getItem('risks') || '[]');
      const compliance = JSON.parse(localStorage.getItem('compliance') || '[]');

      const apiUrl = '/api/sync';
      const headers = {
        'Content-Type': 'application/json',
        
      };

      // Sync each data type
      const syncPromises = [
        { type: 'occurrences', data: occurrences },
        { type: 'incidents', data: incidents },
        { type: 'risks', data: risks },
        { type: 'compliance', data: compliance }
      ].map(async ({ type, data }) => {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ type, data })
        });

        if (!response.ok) {
          throw new Error(`Failed to sync ${type}: ${response.statusText}`);
        }

        return response.json();
      });

      const results = await Promise.all(syncPromises);
      
      setSyncStatus('success');
      setLastSync(new Date().toISOString());
      setSyncMessage(`Successfully synced: ${results.map(r => `${r.count} ${Object.keys(results[0])[0]}`).join(', ')}`);
      
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncing(false);
    }
  };

  const testApiConnection = async () => {
    try {
      const response = await fetch('/health');
      const data = await response.json();
      
      if (response.ok) {
        setSyncStatus('success');
        setSyncMessage(`API is healthy: ${data.status}`);
      } else {
        setSyncStatus('error');
        setSyncMessage('API is not responding correctly');
      }
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage('Cannot connect to API server. Make sure the server is running.');
    }
  };

  const getDataCounts = () => {
    return {
      occurrences: JSON.parse(localStorage.getItem('occurrences') || '[]').length,
      incidents: JSON.parse(localStorage.getItem('incidents') || '[]').length,
      risks: JSON.parse(localStorage.getItem('risks') || '[]').length,
      compliance: JSON.parse(localStorage.getItem('compliance') || '[]').length
    };
  };

  const dataCounts = getDataCounts();

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Data Sync</CardTitle>
        <CardDescription>
          Sync your app data to the API server for Power BI integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Data Summary */}
        <div>
          <h4 className="font-medium mb-2">Current Data in App:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Badge variant="outline">Occurrences: {dataCounts.occurrences}</Badge>
            <Badge variant="outline">Incidents: {dataCounts.incidents}</Badge>
            <Badge variant="outline">Risks: {dataCounts.risks}</Badge>
            <Badge variant="outline">Compliance: {dataCounts.compliance}</Badge>
          </div>
        </div>

        {/* Sync Status */}
        {syncMessage && (
          <Alert>
            <AlertDescription>
              {syncMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={testApiConnection} variant="outline">
            Test API Connection
          </Button>
          <Button 
            onClick={syncDataToAPI} 
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : 'Sync Data to API'}
          </Button>
        </div>

        {/* Last Sync Info */}
        {lastSync && (
          <div className="text-sm text-muted-foreground">
            Last sync: {new Date(lastSync).toLocaleString()}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">For Power BI Integration:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Make sure the API server is running (test connection above)</li>
            <li>Sync your data to the database</li>
            <li>In Power BI: Get Data â†’ Web â†’ <code>http://localhost:3001/api/occurrences</code></li>
            <li>Add headers: <code>x-client-id: key_admin</code>, <code>x-client-secret: secret_admin</code></li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

