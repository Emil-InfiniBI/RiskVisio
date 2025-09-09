import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  loadOccurrenceTypes, 
  loadFactoryHierarchy,
  FACTORY_OPTIONS,
  CURRENT_FACTORY
} from '@/lib/occurrence-options';
import { HierarchicalLocationSelector } from '@/components/HierarchicalLocationSelector';
import { generateYearlyId } from '@/lib/id';
import { getTenantId, withTenantPrefix } from '@/lib/tenant';
import { Occurrence, Factory } from '@/types';
import { getCurrentUser } from '@/lib/user-management';

// Load current options from storage/config
const occurrenceTypes = loadOccurrenceTypes();

// kept for defaults only (not shown in UI)
const priorities = ['low','medium','high','critical'] as const;
const statuses = ['reported','under-review','investigated','closed'] as const;
const factories: Factory[] = ['BTL', 'BTO', 'BTI', 'BTX', 'BTT', 'BTG'];

interface OccurrenceFormProps {
  occurrence?: Occurrence;
  onSubmit: (occurrence: Occurrence) => void;
  onClose: () => void;
  currentFactory?: Factory; // Add current factory prop
}

export function OccurrenceForm({ occurrence, onSubmit, onClose, currentFactory }: OccurrenceFormProps) {
  const [formData, setFormData] = useState({
  title: occurrence?.title || '', // retained in state but not shown in UI per request
  type: occurrence?.type || '',
    factory: occurrence?.factory || currentFactory || 'BTL',
    priority: occurrence?.priority || 'medium',
  status: occurrence?.status || 'reported',
    reportedDate: occurrence?.reportedDate || new Date().toISOString().split('T')[0],
  reportedTime: occurrence?.reportedTime || new Date().toTimeString().slice(0,5),
    reportedBy: occurrence?.reportedBy || '',
  description: occurrence?.description || '', // retained but hidden in UI
  location: occurrence?.location || '',
    involvedPersons: occurrence?.involvedPersons || [],
    correctiveActions: occurrence?.correctiveActions || [],
    evidence: occurrence?.evidence || []
  });

  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);

  // Get current factory and load its location hierarchy dynamically
  const currentUser = getCurrentUser();
  const selectedFactory = (currentFactory || formData.factory) as Factory;
  const locationHierarchy = useMemo(() => {
    return loadFactoryHierarchy(selectedFactory);
  }, [selectedFactory]);

  // All extra inputs removed per request

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that type is selected
    if (!formData.type) {
      alert('Please select an occurrence type from the "What?" dropdown.');
      return;
    }
    
    // Compute ID: keep when editing, otherwise generate YYYY-0001 based on occurrences in storage
    let id = occurrence?.id;
    if (!id) {
      try {
        const tenant = getTenantId();
        const tenantKey = withTenantPrefix('occurrences', undefined, tenant);
        const rawTenant = localStorage.getItem(tenantKey);
        const rawGlobal = localStorage.getItem('occurrences');
        const raw = rawTenant ?? rawGlobal;
        const list: Occurrence[] = raw ? JSON.parse(raw) : [];
        const existingIds = Array.isArray(list) ? list.map(o => o.id) : [];
        id = generateYearlyId(existingIds);
      } catch {
        const year = new Date().getFullYear();
        id = `${year}-0001`;
      }
    }

    const newOccurrence: Occurrence = {
      id,
      ...formData,
      priority: formData.priority as Occurrence['priority'],
      status: formData.status as Occurrence['status'],
      type: formData.type as Occurrence['type'],
      factory: formData.factory as Factory
    };

    onSubmit(newOccurrence);
  };

  // Removed add/remove handlers for extra sections

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="!w-[90vw] !max-w-6xl !max-h-[90vh] overflow-y-auto p-8 sm:!max-w-6xl md:!max-w-6xl lg:!max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New occurrence</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Top pill indicating the current section */}
          <div className="flex items-center gap-3">
            <Button type="button" variant="default" className="rounded-full px-4 py-1">Occurrence</Button>
          </div>

          <Accordion type="single" collapsible defaultValue="details">
            <AccordionItem value="details">
              <AccordionTrigger className="text-base">Occurrence details</AccordionTrigger>
              <AccordionContent className="pt-6">
                <div className="grid grid-cols-2 gap-12">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="reportedDate" className="text-sm font-medium">When?</Label>
                      <Input
                        id="reportedDate"
                        type="date"
                        value={formData.reportedDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, reportedDate: e.target.value }))}
                        required
                        className="w-full h-12"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="reportedTime" className="text-sm font-medium">Time</Label>
                      <Input
                        id="reportedTime"
                        type="time"
                        value={formData.reportedTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, reportedTime: e.target.value }))}
                        required
                        className="w-full h-12"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="location" className="text-sm font-medium">Where?</Label>
                      <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full h-12 justify-start text-left font-normal"
                          >
                            {formData.location || "Select location..."}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-96 p-0" align="start">
                          <HierarchicalLocationSelector
                            locations={locationHierarchy}
                            onLocationsChange={() => {}} // Read-only in form
                            selectedLocation={selectedLocationId}
                            onLocationSelect={(locationId, fullPath) => {
                              setSelectedLocationId(locationId);
                              setFormData(prev => ({ ...prev, location: fullPath }));
                              setLocationPopoverOpen(false);
                            }}
                            mode="select"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="type" className="text-sm font-medium">What?</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Occurrence['type'] }))}>
                        <SelectTrigger className="w-full h-12">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {occurrenceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

  {/* Only show the minimal fields requested, nothing else. */}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {occurrence ? 'Update Occurrence' : 'Report Occurrence'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}