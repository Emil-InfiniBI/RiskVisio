// Central place to administer Occurrence form dropdowns
// Edit these arrays to change options shown in the form.

export const OCCURRENCE_TYPE_OPTIONS = [
  { value: 'risk-observation', label: 'Risk observation' },
  { value: 'near-miss', label: 'Near miss' },
  { value: 'accident', label: 'Accident' },
  { value: 'commuting-accident', label: 'Commuting accident' },
  { value: 'work-related-illness', label: 'Work-related illness' },
  { value: 'environment', label: 'Environment' },
  { value: 'improvement-proposal', label: 'Improvement proposal' },
] as const;

// Hierarchical location structure for different factories
export interface LocationNode {
  id: string;
  label: string;
  children?: LocationNode[];
}

// Factory codes and their display names
export const FACTORY_OPTIONS = [
  { code: 'BTL', name: 'BTL' },
  { code: 'BTO', name: 'BTO' },
  { code: 'BTI', name: 'BTI' },
  { code: 'BTX', name: 'BTX' },
  { code: 'BTT', name: 'BTT' },
  { code: 'BTG', name: 'BTG' },
] as const;

// Default factory hierarchy structures
export const FACTORY_HIERARCHIES: Record<string, LocationNode[]> = {
  'BTG': [
    {
      id: 'finance',
      label: 'Finance',
    },
    {
      id: 'hse',
      label: 'HSE',
    },
    {
      id: 'transport',
      label: 'Transport',
    },
    {
      id: 'pe',
      label: 'PE (Production Engineering)',
      children: [
        { id: 'pe-modellforrad', label: 'Modellförråd' },
        { id: 'pe-modellgaraget', label: 'Modellgaraget' },
        { id: 'pe-modellverkstad', label: 'Modellverkstad' },
        { id: 'pe-people-growth', label: 'People & Growth' },
      ],
    },
    {
      id: 'production',
      label: 'Production',
      children: [
        { id: 'prod-blaster', label: 'Blaster' },
        { id: 'prod-f1', label: 'F1' },
        { id: 'prod-f2', label: 'F2' },
        { id: 'prod-fat', label: 'FAT' },
        { id: 'prod-karnmakeri', label: 'Kärnmakeri' },
        { id: 'prod-rensning', label: 'Rensning' },
        { id: 'prod-rortejpning', label: 'Rörtejpning' },
        { id: 'prod-smaltverk', label: 'Smältverk' },
        { id: 'prod-svets', label: 'Svets' },
        { id: 'prod-ugnsmuming', label: 'Ugnsmuming' },
        { id: 'prod-urslagningen', label: 'Urslagningen' },
        { id: 'prod-utbildningskoordinator', label: 'Utbildningskoordinator' },
      ],
    },
    {
      id: 'quality',
      label: 'Quality',
      children: [
        {
          id: 'quality-lab',
          label: 'lab',
          children: [
            { id: 'quality-sandlab', label: 'Sandlab' },
            { id: 'quality-syra-harts', label: 'Syra & Harts' },
          ],
        },
        { id: 'quality-ndt', label: 'NDT' },
      ],
    },
    {
      id: 'sourcing',
      label: 'Sourcing',
      children: [
        { id: 'sourcing-forrad', label: 'Förråd' },
      ],
    },
    {
      id: 'general',
      label: 'General Areas',
      children: [
        { id: 'general-assembly', label: 'Assembly' },
        { id: 'general-warehouse', label: 'Warehouse' },
        { id: 'general-office', label: 'Office' },
        { id: 'general-loading-dock', label: 'Loading dock' },
        { id: 'general-parking', label: 'Parking' },
      ],
    },
    {
      id: 'other',
      label: 'Other',
    },
  ],
  'BTL': [
    {
      id: 'production',
      label: 'Production',
      children: [
        { id: 'prod-line1', label: 'Production Line 1' },
        { id: 'prod-line2', label: 'Production Line 2' },
        { id: 'prod-assembly', label: 'Assembly Area' },
      ],
    },
    {
      id: 'quality',
      label: 'Quality',
      children: [
        { id: 'quality-inspection', label: 'Inspection' },
        { id: 'quality-testing', label: 'Testing' },
      ],
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      children: [
        { id: 'maint-electrical', label: 'Electrical' },
        { id: 'maint-mechanical', label: 'Mechanical' },
      ],
    },
    {
      id: 'office',
      label: 'Office Areas',
      children: [
        { id: 'office-admin', label: 'Administration' },
        { id: 'office-hr', label: 'HR' },
      ],
    },
  ],
  'BTO': [
    {
      id: 'production',
      label: 'Production',
      children: [
        { id: 'prod-molding', label: 'Molding' },
        { id: 'prod-finishing', label: 'Finishing' },
        { id: 'prod-packaging', label: 'Packaging' },
      ],
    },
    {
      id: 'warehouse',
      label: 'Warehouse',
      children: [
        { id: 'warehouse-raw', label: 'Raw Materials' },
        { id: 'warehouse-finished', label: 'Finished Goods' },
      ],
    },
    {
      id: 'office',
      label: 'Office Areas',
    },
  ],
  'BTI': [
    {
      id: 'production',
      label: 'Production',
      children: [
        { id: 'prod-cutting', label: 'Cutting' },
        { id: 'prod-welding', label: 'Welding' },
        { id: 'prod-painting', label: 'Painting' },
      ],
    },
    {
      id: 'shipping',
      label: 'Shipping & Receiving',
    },
    {
      id: 'office',
      label: 'Office Areas',
    },
  ],
  'BTX': [
    {
      id: 'production',
      label: 'Production',
      children: [
        { id: 'prod-machining', label: 'Machining' },
        { id: 'prod-assembly', label: 'Assembly' },
      ],
    },
    {
      id: 'quality',
      label: 'Quality Control',
    },
    {
      id: 'office',
      label: 'Office Areas',
    },
  ],
  'BTT': [
    {
      id: 'production',
      label: 'Production',
      children: [
        { id: 'prod-forming', label: 'Forming' },
        { id: 'prod-treatment', label: 'Treatment' },
      ],
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
    },
    {
      id: 'office',
      label: 'Office Areas',
    },
  ],
};

// Storage key for persisting data
const STORAGE_KEY_PREFIX = 'baettr-risk-management';

// Save/Load functions for persistence
export const saveFactoryHierarchy = (factoryCode: string, hierarchy: LocationNode[]) => {
  const key = `${STORAGE_KEY_PREFIX}-hierarchy-${factoryCode}`;
  localStorage.setItem(key, JSON.stringify(hierarchy));
};

export const loadFactoryHierarchy = (factoryCode: string): LocationNode[] => {
  const key = `${STORAGE_KEY_PREFIX}-hierarchy-${factoryCode}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored hierarchy for', factoryCode);
    }
  }
  return FACTORY_HIERARCHIES[factoryCode] || FACTORY_HIERARCHIES['BTG'];
};

export const saveOccurrenceTypes = (types: Array<{value: string; label: string}>) => {
  const key = `${STORAGE_KEY_PREFIX}-occurrence-types`;
  localStorage.setItem(key, JSON.stringify(types));
};

export const loadOccurrenceTypes = (): Array<{value: string; label: string}> => {
  const key = `${STORAGE_KEY_PREFIX}-occurrence-types`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored occurrence types');
    }
  }
  return [...OCCURRENCE_TYPE_OPTIONS];
};

// Current active factory (this would typically be set based on user login)
export let CURRENT_FACTORY = 'BTG';

// Function to set current factory
export const setCurrentFactory = (factoryCode: string) => {
  CURRENT_FACTORY = factoryCode;
  localStorage.setItem(`${STORAGE_KEY_PREFIX}-current-factory`, factoryCode);
};

// Load current factory from storage
const loadCurrentFactory = (): string => {
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}-current-factory`);
  return stored || 'BTG';
};

// Initialize current factory
CURRENT_FACTORY = loadCurrentFactory();

// Get current factory's hierarchy
export const getCurrentLocationHierarchy = (): LocationNode[] => {
  return loadFactoryHierarchy(CURRENT_FACTORY);
};

// Backward compatibility - export the current factory's hierarchy as LOCATION_HIERARCHY
export const LOCATION_HIERARCHY = getCurrentLocationHierarchy();

// Helper functions (keep existing ones for compatibility)
export const findLocationNode = (nodes: LocationNode[], id: string): LocationNode | null => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findLocationNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const getLocationPath = (nodes: LocationNode[], targetId: string, path: string[] = []): string[] | null => {
  for (const node of nodes) {
    const currentPath = [...path, node.label];
    
    if (node.id === targetId) {
      return currentPath;
    }
    
    if (node.children) {
      const found = getLocationPath(node.children, targetId, currentPath);
      if (found) return found;
    }
  }
  return null;
};

// Convert to flat options for backwards compatibility
export const LOCATION_OPTIONS = LOCATION_HIERARCHY.map(location => ({
  value: location.id,
  label: location.label
}));

export const WHO_OPTIONS = [
  { value: 'employee', label: 'Employee' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'visitor', label: 'Visitor' },
  { value: 'other', label: 'Other' },
] as const;

export const IMMEDIATE_ACTION_OPTIONS = [
  { value: 'none', label: 'None taken' },
  { value: 'area-secured', label: 'Area secured' },
  { value: 'equipment-stopped', label: 'Equipment stopped' },
  { value: 'first-aid', label: 'First aid given' },
  { value: 'emergency-services', label: 'Emergency services called' },
  { value: 'supervisor-notified', label: 'Supervisor notified' },
  { value: 'other', label: 'Other (specify in description)' },
] as const;

export const OPERATING_SITUATION_OPTIONS = [
  { value: 'installation-modification-equipment', label: 'Installation or modification of equipment in production and workshop' },
  { value: 'installation-assembly-reconstruction', label: 'Installation/assembly/reconstruction' },
  { value: 'operation', label: 'Operation' },
  { value: 'operation-stop-planned', label: 'Operation stop, planned' },
  { value: 'operation-stop-unplanned', label: 'Operation stop, unplanned (Failure)' },
  { value: 'other', label: 'Other' },
  { value: 'planned-operation-stop-maintenance', label: 'Planned operation stop / maintenance' },
  { value: 'registration-not-required', label: 'Registration is not required' },
  { value: 'regular-operation', label: 'Regular operation' },
  { value: 'test-operation-startup', label: 'Test operation/start-up' },
  { value: 'traffic', label: 'Traffic' },
  { value: 'transport', label: 'Transport' },
] as const;
