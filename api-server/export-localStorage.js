// Utility script to sync localStorage data to API server
// Run this in your browser's console to export data

function exportLocalStorageToAPI() {
  const data = {};
  
  // Extract all relevant data from localStorage
  const keys = ['occurrences', 'incidents', 'risks', 'compliance'];
  
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        data[key] = value; // Store as string (already JSON)
      } catch (e) {
        console.warn(`Failed to parse ${key}:`, e);
      }
    }
  });
  
  console.log('localStorage Data Export:');
  console.log(JSON.stringify(data, null, 2));
  
  // Copy to clipboard if possible
  if (navigator.clipboard) {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      .then(() => console.log('Data copied to clipboard!'))
      .catch(err => console.error('Failed to copy to clipboard:', err));
  }
  
  return data;
}

// Call this function in your browser console:
// exportLocalStorageToAPI();
