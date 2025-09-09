// Data sync utility for Risk Management Frontend
// Add this to your main app to automatically sync data to the API

export class DataSyncService {
  private apiBaseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private syncInterval: number;
  private intervalId?: number;

  constructor(config: {
    apiBaseUrl: string;
    clientId: string;
    clientSecret: string;
    syncInterval?: number; // minutes
  }) {
    this.apiBaseUrl = config.apiBaseUrl;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.syncInterval = (config.syncInterval || 5) * 60 * 1000; // Convert to milliseconds
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': this.clientId,
        'x-client-secret': this.clientSecret,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async syncTable(tableName: string) {
    try {
      // Get data from localStorage
      const data = localStorage.getItem(tableName);
      if (!data) {
        console.log(`No data found for table: ${tableName}`);
        return { success: true, message: 'No data to sync' };
      }

      const parsedData = JSON.parse(data);
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        console.log(`No records found for table: ${tableName}`);
        return { success: true, message: 'No records to sync' };
      }

      // Sync to API
      const result = await this.makeRequest('/api/sync', {
        method: 'POST',
        body: JSON.stringify({
          table: tableName,
          data: parsedData,
          operation: 'upsert'
        }),
      });

      console.log(`✅ Synced ${tableName}:`, result);
      return { success: true, ...result };
    } catch (error) {
      console.error(`❌ Failed to sync ${tableName}:`, error);
      return { success: false, error: error.message };
    }
  }

  async syncAllData() {
    const tables = ['occurrences', 'incidents', 'risks', 'compliance'];
    const results = {};

    for (const table of tables) {
      results[table] = await this.syncTable(table);
    }

    return results;
  }

  async testConnection() {
    try {
      const response = await this.makeRequest('/health');
      console.log('✅ API connection test successful:', response);
      return { success: true, ...response };
    } catch (error) {
      console.error('❌ API connection test failed:', error);
      return { success: false, error: error.message };
    }
  }

  startAutoSync() {
    if (this.intervalId) {
      console.log('Auto-sync already running');
      return;
    }

    console.log(`🔄 Starting auto-sync every ${this.syncInterval / 60000} minutes`);
    
    // Initial sync
    this.syncAllData();
    
    // Set up interval
    this.intervalId = setInterval(() => {
      console.log('🔄 Auto-sync triggered...');
      this.syncAllData();
    }, this.syncInterval);
  }

  stopAutoSync() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log('⏹️ Auto-sync stopped');
    }
  }

  // Manual sync button for admin panel
  async manualSync() {
    console.log('🔄 Manual sync triggered...');
    const results = await this.syncAllData();
    
    // Show user-friendly results
    const summary = Object.entries(results)
      .map(([table, result]: [string, any]) => {
        if (result.success) {
          return `${table}: ${result.processed || 0} records synced`;
        } else {
          return `${table}: Failed - ${result.error}`;
        }
      })
      .join('\n');

    alert(`Sync Results:\n\n${summary}`);
    return results;
  }
}

// Usage example for your main app:
/*
// In your main App.tsx or configuration
const dataSyncService = new DataSyncService({
  apiBaseUrl: 'http://localhost:3001',
  clientId: 'key_xxxxxxxxx',
  clientSecret: 'secret_xxxxxxxxxxxxxxxxx',
  syncInterval: 5 // sync every 5 minutes
});

// Test connection on app start
dataSyncService.testConnection();

// Start auto-sync
dataSyncService.startAutoSync();

// Add manual sync button to admin panel
<Button onClick={() => dataSyncService.manualSync()}>
  Sync Data to API
</Button>
*/
