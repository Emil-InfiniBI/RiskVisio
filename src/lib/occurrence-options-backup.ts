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
  factory?: string; // Optional factory association
}

export const LOCATION_HIERARCHY: LocationNode[] = [
  {
    id: 'baettr-main',
    label: 'Baettr Guldsmedshyttan AB',
    children: [
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
  },
];

// Helper function to flatten hierarchy for backwards compatibility
export const LOCATION_OPTIONS = (() => {
  const flatten = (nodes: LocationNode[], prefix = ''): string[] => {
    const result: string[] = [];
    for (const node of nodes) {
      const fullPath = prefix ? `${prefix} - ${node.label}` : node.label;
      result.push(fullPath);
      if (node.children) {
        result.push(...flatten(node.children, fullPath));
      }
    }
    return result;
  };
  return flatten(LOCATION_HIERARCHY);
})();

// Helper functions for working with hierarchical locations
export const findLocationNode = (id: string, nodes: LocationNode[] = LOCATION_HIERARCHY): LocationNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findLocationNode(id, node.children);
      if (found) return found;
    }
  }
  return null;
};

export const getLocationPath = (id: string, nodes: LocationNode[] = LOCATION_HIERARCHY, path: string[] = []): string[] => {
  for (const node of nodes) {
    const currentPath = [...path, node.label];
    if (node.id === id) return currentPath;
    if (node.children) {
      const found = getLocationPath(id, node.children, currentPath);
      if (found.length > 0) return found;
    }
  }
  return [];
};
