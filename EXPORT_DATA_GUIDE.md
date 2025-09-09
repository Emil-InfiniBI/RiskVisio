# 🔄 Simple Solution: Export Your Data to Power BI

Since the real-time sync requires more setup, here's a simple solution to get your actual app data into Power BI:

## ✅ Step 1: Export Your Data

1. **Open your risk management app** in the browser
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Copy and paste this script:**

```javascript
// Export all your app data to JSON files
function exportAppDataForPowerBI() {
    const data = {
        occurrences: JSON.parse(localStorage.getItem('occurrences') || '[]'),
        incidents: JSON.parse(localStorage.getItem('incidents') || '[]'), 
        risks: JSON.parse(localStorage.getItem('risks') || '[]'),
        compliance: JSON.parse(localStorage.getItem('compliance') || '[]')
    };
    
    // Download each dataset as JSON file
    Object.keys(data).forEach(key => {
        const blob = new Blob([JSON.stringify(data[key], null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${key}_data.json`;
        a.click();
        URL.revokeObjectURL(url);
    });
    
    console.log('Data exported! Check your Downloads folder.');
    return data;
}

// Run the export
exportAppDataForPowerBI();
```

## 📊 Step 2: Import to Power BI

1. **Open Power BI Desktop**
2. **Get Data** → **JSON**
3. **Select your exported files:**
   - `occurrences_data.json` (your main incident reports)
   - `incidents_data.json` 
   - `risks_data.json`
   - `compliance_data.json`

4. **Power BI will load your actual data!**

## 🎯 Alternative: Manual CSV Export

If JSON doesn't work, you can export as CSV:

```javascript
// Export as CSV for easier Power BI import
function exportAsCSV() {
    const occurrences = JSON.parse(localStorage.getItem('occurrences') || '[]');
    
    if (occurrences.length === 0) {
        console.log('No occurrences found. Create some data in your app first.');
        return;
    }
    
    // Convert to CSV
    const headers = Object.keys(occurrences[0]).join(',');
    const rows = occurrences.map(item => 
        Object.values(item).map(val => 
            typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        ).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    
    // Download CSV
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'occurrences_data.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('CSV exported! Import this into Power BI.');
}

// Run CSV export
exportAsCSV();
```

## 🔄 Step 3: Refresh Data

Whenever you add new data to your app:
1. **Run the export script again**
2. **Refresh your Power BI dataset**
3. **Your reports will show the latest data**

## 🚀 Production Solution

For automatic syncing in production, you would:
1. **Deploy your app to Azure Static Web Apps**
2. **Set up Azure SQL Database** 
3. **Connect Power BI directly to the database**
4. **Enable automatic refresh**

But for now, the export method will get your real data into Power BI immediately!

## 📋 What You'll See in Power BI

Instead of the sample data showing:
- RISK-001, RISK-002 (sample)

You'll see your actual data:
- 2025-0001, 2025-0002, 2025-0003 (your real occurrences)
- BTT factory data
- Your actual incident reports
- Real status and type information

Try this now and let me know what you see!
