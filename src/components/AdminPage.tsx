import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import the options
import { 
  FACTORY_OPTIONS, 
  FACTORY_HIERARCHIES,
  LocationNode, 
  CURRENT_FACTORY,
  setCurrentFactory,
  loadFactoryHierarchy,
  saveFactoryHierarchy,
  loadOccurrenceTypes,
  saveOccurrenceTypes
} from '@/lib/occurrence-options';
import { HierarchicalLocationSelector } from '@/components/HierarchicalLocationSelector';
import ApiKeyManagement from '@/components/ApiKeyManagement';
import ApiSync from '@/components/ApiSync';

interface AdminProps {
  onBack: () => void;
  currentUser?: string;
}

// Create mutable types for admin editing
type MutableOccurrenceType = {
  value: string;
  label: string;
};

export default function AdminPage({ onBack, currentUser = 'admin' }: AdminProps) {
  // State for current factory selection
  const [selectedFactory, setSelectedFactory] = useState<string>(CURRENT_FACTORY);
  
  // State for managing dropdown options
  const [occurrenceTypes, setOccurrenceTypes] = useState<MutableOccurrenceType[]>([]);
  const [locationHierarchy, setLocationHierarchy] = useState<LocationNode[]>([]);
  
  // State for adding new items
  const [newOccurrenceType, setNewOccurrenceType] = useState({ value: '', label: '' });
  
  // State for feedback
  const [saveMessage, setSaveMessage] = useState('');

  // Load data when component mounts or factory changes
  useEffect(() => {
    const loadedTypes = loadOccurrenceTypes();
    const loadedHierarchy = loadFactoryHierarchy(selectedFactory);
    
    setOccurrenceTypes(loadedTypes.map(opt => ({ value: opt.value, label: opt.label })));
    setLocationHierarchy([...loadedHierarchy]);
  }, [selectedFactory]);

  // Handle factory change
  const handleFactoryChange = (factoryCode: string) => {
    setSelectedFactory(factoryCode);
    setCurrentFactory(factoryCode);
  };

  // Handlers for occurrence types
  const addOccurrenceType = () => {
    if (newOccurrenceType.value && newOccurrenceType.label) {
      setOccurrenceTypes([...occurrenceTypes, { ...newOccurrenceType }]);
      setNewOccurrenceType({ value: '', label: '' });
    }
  };

  const removeOccurrenceType = (index: number) => {
    setOccurrenceTypes(occurrenceTypes.filter((_, i) => i !== index));
  };

  const updateOccurrenceType = (index: number, field: 'value' | 'label', newValue: string) => {
    const updated = [...occurrenceTypes];
    updated[index][field] = newValue;
    setOccurrenceTypes(updated);
  };

  // Save handler - now actually persists data
  const handleSave = () => {
    try {
      // Save occurrence types
      saveOccurrenceTypes(occurrenceTypes);
      
      // Save location hierarchy for current factory
      saveFactoryHierarchy(selectedFactory, locationHierarchy);
      
      setSaveMessage('✅ Configuration saved successfully! Changes are now persisted.');
      setTimeout(() => setSaveMessage(''), 5000);
    } catch (error) {
      setSaveMessage('❌ Failed to save configuration. Please try again.');
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  // Helper function to count total locations in hierarchy
  const countLocations = (nodes: LocationNode[]): number => {
    return nodes.reduce((count, node) => {
      return count + 1 + (node.children ? countLocations(node.children) : 0);
    }, 0);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Button onClick={onBack} variant="outline" className="mb-4">
          ← Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold mb-2">Admin Configuration</h1>
        <p className="text-muted-foreground">
          Manage system settings, dropdown options, and API access
        </p>
      </div>

      {saveMessage && (
        <Alert className="mb-6">
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuration">Form Configuration</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="api-sync">API Sync</TabsTrigger>
        </TabsList>
        
        <TabsContent value="configuration" className="space-y-6">
          {/* Factory Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Factory Selection</CardTitle>
              <CardDescription>
                Choose which factory to configure. Each factory has its own location hierarchy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <Label htmlFor="factory-select">Current Factory</Label>
                  <Select value={selectedFactory} onValueChange={handleFactoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a factory" />
                    </SelectTrigger>
                    <SelectContent>
                      {FACTORY_OPTIONS.map((factory) => (
                        <SelectItem key={factory.code} value={factory.code}>
                          {factory.code} - {factory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Badge variant="outline" className="text-sm">
                    Currently configuring: {FACTORY_OPTIONS.find(f => f.code === selectedFactory)?.name}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Occurrence Types Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  What? - Occurrence Types
                </CardTitle>
                <CardDescription>
                  Manage the types of occurrences that can be reported
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new occurrence type */}
                <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                  <Label className="text-sm font-medium">Add New Occurrence Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="new-occ-value" className="text-xs">Value (ID)</Label>
                      <Input
                        id="new-occ-value"
                        placeholder="e.g., safety-issue"
                        value={newOccurrenceType.value}
                        onChange={(e) => setNewOccurrenceType({ ...newOccurrenceType, value: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-occ-label" className="text-xs">Display Label</Label>
                      <Input
                        id="new-occ-label"
                        placeholder="e.g., Safety Issue"
                        value={newOccurrenceType.label}
                        onChange={(e) => setNewOccurrenceType({ ...newOccurrenceType, label: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={addOccurrenceType} size="sm" className="w-full">
                    + Add Occurrence Type
                  </Button>
                </div>

                {/* Existing occurrence types */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Current Occurrence Types</Label>
                  {occurrenceTypes.map((type, index) => (
                    <div key={index} className="flex gap-2 items-center p-2 border rounded">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          value={type.value}
                          onChange={(e) => updateOccurrenceType(index, 'value', e.target.value)}
                          className="h-8"
                        />
                        <Input
                          value={type.label}
                          onChange={(e) => updateOccurrenceType(index, 'label', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <Button
                        onClick={() => removeOccurrenceType(index)}
                        variant="destructive"
                        size="sm"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Hierarchical Locations Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Where? - Hierarchical Locations & Departments
                </CardTitle>
                <CardDescription>
                  Manage organizational structure with expandable categories. Click + to add children, - to remove items.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Location Hierarchy ({countLocations(locationHierarchy)} total locations)
                  </Label>
                  <div className="border rounded">
                    <HierarchicalLocationSelector
                      locations={locationHierarchy}
                      onLocationsChange={setLocationHierarchy}
                      mode="admin"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Configuration */}
          <div className="mt-6">
            <Separator className="mb-4" />
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Configuration Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {occurrenceTypes.length} occurrence types • {countLocations(locationHierarchy)} locations
                </p>
              </div>
              <Button onClick={handleSave} size="lg">
                💾 Save Configuration
              </Button>
            </div>
          </div>

          {/* Preview Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                This is how the options will appear in the occurrence form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">What? Options</Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto border rounded p-2">
                    {occurrenceTypes.map((type, index) => (
                      <Badge key={index} variant="secondary" className="mr-1 mb-1">
                        {type.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Where? Options</Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto border rounded p-2">
                    <HierarchicalLocationSelector
                      locations={locationHierarchy}
                      onLocationsChange={() => {}} // Read-only preview
                      mode="select"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <ApiKeyManagement currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="api-sync">
          <ApiSync currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
