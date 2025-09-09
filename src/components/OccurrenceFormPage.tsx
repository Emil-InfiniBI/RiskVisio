import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  loadOccurrenceTypes, 
  loadFactoryHierarchy,
  FACTORY_OPTIONS,
  CURRENT_FACTORY,
  OPERATING_SITUATION_OPTIONS
} from '@/lib/occurrence-options';
import { HierarchicalLocationSelector } from '@/components/HierarchicalLocationSelector';
import { generateYearlyId, isYearlyId } from '@/lib/id';
import { getTenantId, withTenantPrefix } from '@/lib/tenant';
import { Occurrence, Factory, User } from '@/types';
import { getCurrentUser } from '@/lib/user-management';

// Load current options from storage/config
const occurrenceTypes = loadOccurrenceTypes();

// kept for defaults only (not shown in UI)
const priorities = ['low','medium','high','critical'] as const;
const statuses = ['reported','under-review','investigated','closed'] as const;

interface OccurrenceFormPageProps {
  occurrence?: Occurrence;
  onSubmit: (occurrence: Occurrence) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  currentFactory?: Factory;
  currentUser?: User;
  readOnly?: boolean;
  onDirtyChange?: (dirty: boolean) => void; // Notify parent about unsaved change state
}

export function OccurrenceFormPage({ occurrence, onSubmit, onCancel, onDelete, currentFactory, currentUser, readOnly, onDirtyChange }: OccurrenceFormPageProps) {
  const isReadOnly = !!readOnly;
  // Get available factories based on user permissions
  const getAvailableFactories = (): Factory[] => {
    const allFactories: Factory[] = ['BTL', 'BTO', 'BTI', 'BTX', 'BTT', 'BTG'];
    if (!currentUser) return allFactories;
    if (currentUser.role === 'admin') return allFactories;
    return currentUser.factories;
  };

  const availableFactories = getAvailableFactories();
  const [formData, setFormData] = useState({
    title: occurrence?.title || '', // Manual field for occurrence title
    type: occurrence?.type || 'risk-observation',
    factory: occurrence?.factory || currentFactory || 'BTL',
    priority: occurrence?.priority || 'medium',
    status: occurrence?.status || 'reported',
    reportedDate: occurrence?.reportedDate || new Date().toISOString().split('T')[0],
    reportedTime: occurrence?.reportedTime || new Date().toTimeString().slice(0,5),
    reportedBy: occurrence?.reportedBy || '',
    reportedByName: occurrence?.reportedByName || currentUser?.fullName || 'Emil Dybeck', // Auto-filled from current user
    reportedByEmail: occurrence?.reportedByEmail || currentUser?.email || 'emil.dybeck@baettr.com', // Auto-filled from current user
    description: occurrence?.description || 'Risk observation details automatically populated based on occurrence type and location', // Auto-filled description
    location: occurrence?.location || '',
    involvedPersons: occurrence?.involvedPersons || [],
    correctiveActions: occurrence?.correctiveActions || [],
    evidence: occurrence?.evidence || [],
    courseOfEvents: occurrence?.courseOfEvents || '', // Manual field for course of events
    involvedOpinion: occurrence?.involvedOpinion || '',
    involvedProposal: occurrence?.involvedProposal || '',
    operatingSituation: occurrence?.operatingSituation || '',
    injuryRisk: occurrence?.injuryRisk || '',
    locationDetails: occurrence?.locationDetails || '',
    objectId: occurrence?.objectId || '',
    activity: occurrence?.activity || '',
    qhseRepresentative: occurrence?.qhseRepresentative || '',
    incidentCategories: occurrence?.incidentCategories || [],
    processing: occurrence?.processing || [],
    restrictedAccess: occurrence?.restrictedAccess || false,
    employee: occurrence?.employee || true,
    occurrenceManager: occurrence?.occurrenceManager || '', // Manual field for occurrence manager
    // Accident-specific fields
    sickLeave: occurrence?.sickLeave || 'none',
    jobTransferDays: occurrence?.jobTransferDays || '',
    permanentJobTransfer: occurrence?.permanentJobTransfer || false,
    medicallyTreated: occurrence?.medicallyTreated || false,
    injuryTypes: occurrence?.injuryTypes || [],
    injuredBodyParts: occurrence?.injuredBodyParts || []
  });

  const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Helper function to update form data and track changes
  const updateFormData = (updater: (prev: any) => any) => {
    if (isReadOnly) return;
    setFormData(updater);
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
      onDirtyChange?.(true);
    }
  };

  // Reflect hasUnsavedChanges transitions to parent (covers non-updateFormData paths)
  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  // Load factory-specific location hierarchy
  const locationHierarchy = useMemo(() => {
    const selectedFactory = currentFactory || formData.factory as Factory;
    return loadFactoryHierarchy(selectedFactory);
  }, [currentFactory, formData.factory]);

  // Auto-update fields when factory or type changes
  useEffect(() => {
    if (!occurrence) { // Only update for new occurrences, not when editing
      const selectedFactory = currentFactory || formData.factory as Factory;
      const occurrenceTypeLabel = occurrenceTypes.find(t => t.value === formData.type)?.label || 'Risk Observation';
      
      if (!isReadOnly) {
        setFormData(prev => ({
          ...prev,
          description: `${occurrenceTypeLabel} details automatically populated for ${selectedFactory} factory based on occurrence type and location settings.`
        }));
      }
    }
  }, [formData.factory, formData.type, currentFactory, occurrence, isReadOnly]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    // Validate user has access to the selected factory
    if (currentUser && currentUser.role !== 'admin') {
      if (!currentUser.factories.includes(formData.factory as Factory)) {
        alert('You do not have permission to create occurrences for this factory.');
        return;
      }
    }
    
    // Build ID: keep existing if editing; otherwise generate YYYY-0001 based on existing occurrences in storage
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
        // Fallback if storage is unavailable
        const year = new Date().getFullYear();
        id = `${year}-0001`;
      }
    }

    const newOccurrence: Occurrence = {
      id,
      ...formData,
      createdAt: occurrence?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
  onSubmit(newOccurrence);
  setHasUnsavedChanges(false); // Reset unsaved changes flag after successful save
  onDirtyChange?.(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {formData.type === 'risk-observation' ? 'Risk observation' : 'Occurrence'}, F1, 17/09/2025, Registration in progress
              </h1>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-sm"></div>
              </div>
            </div>
            {!isReadOnly && hasUnsavedChanges && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                    <AlertDialogDescription>
                      You have unsaved changes. Are you sure you want to close without saving?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onCancel?.()}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Close without saving
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            {(isReadOnly || !hasUnsavedChanges) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onCancel?.()}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <fieldset disabled={isReadOnly}>
          {/* Top Section - Occurrence Type */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Button type="button" variant="default" className="rounded-full px-3 py-1 text-sm">
                Occurrence
              </Button>
              {isReadOnly && <span className="text-xs text-muted-foreground">Read-only</span>}
            </div>
            
            <div className="flex items-center gap-4 mb-3">
              <Label htmlFor="occurrenceManager" className="text-sm text-gray-600">Occurrence manager:</Label>
              <div className="flex items-center gap-2 flex-1">
                <Input
                  id="occurrenceManager"
                  value={formData.occurrenceManager}
                  onChange={(e) => updateFormData(prev => ({ ...prev, occurrenceManager: e.target.value }))}
                  placeholder="Enter occurrence manager name"
                  className="max-w-xs h-8"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Checkbox 
                  id="restrictedAccess"
                  checked={formData.restrictedAccess}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, restrictedAccess: checked as boolean }))}
                />
                <Label htmlFor="restrictedAccess" className="text-sm">Restricted access</Label>
              </div>
            </div>
          </div>

          {/* Occurrence Details Section */}
          <Accordion type="single" collapsible defaultValue="details" className="mb-4">
            <AccordionItem value="details">
              <AccordionTrigger className="text-base font-medium py-2">Occurrence details</AccordionTrigger>
              <AccordionContent className="pt-2">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="reportedDate" className="text-sm font-medium">When?</Label>
                    <Input
                      id="reportedDate"
                      type="date"
                      value={formData.reportedDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, reportedDate: e.target.value }))}
                      required
                      className="w-full h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reportedTime" className="text-sm font-medium">Time</Label>
                    <Input
                      id="reportedTime"
                      type="time"
                      value={formData.reportedTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, reportedTime: e.target.value }))}
                      required
                      className="w-full h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="location" className="text-sm font-medium">Where?</Label>
                    <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left font-normal h-8"
                        >
                          {formData.location || "Select location..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96 p-0" align="start">
                        <HierarchicalLocationSelector
                          locations={locationHierarchy}
                          onLocationsChange={() => {}}
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
                  <div className="space-y-1">
                    <Label htmlFor="type" className="text-sm font-medium">What?</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Occurrence['type'] }))}>
                      <SelectTrigger className="w-full h-8">
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Reported By Section */}
          <Accordion type="single" collapsible defaultValue="reported-by" className="mb-4">
            <AccordionItem value="reported-by">
              <AccordionTrigger className="text-base font-medium py-2">
                <div className="flex items-center gap-2">
                  Reported by (Auto-filled)
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Employee</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Auto</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="reportedByName" className="text-sm font-medium">Name</Label>
                    <Input
                      id="reportedByName"
                      value={formData.reportedByName}
                      readOnly
                      className="w-full bg-gray-50 h-8"
                      title="Auto-filled from current user"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reportedByEmail" className="text-sm font-medium">E-mail</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="reportedByEmail"
                        type="email"
                        value={formData.reportedByEmail}
                        readOnly
                        className="flex-1 bg-gray-50 h-8"
                        title="Auto-filled from current user"
                      />
                      <Button type="button" variant="ghost" size="sm" className="text-gray-400 h-8 w-8 p-0">📧</Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Course of Events Section */}
          <Accordion type="single" collapsible defaultValue="course-of-events" className="mb-4">
            <AccordionItem value="course-of-events">
              <AccordionTrigger className="text-base font-medium py-2">
                <div className="flex items-center gap-2">
                  <Checkbox defaultChecked />
                  Course of events
                  <span className="text-orange-600 text-sm">📝</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-blue-600">Occurrence title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => updateFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full mt-1 h-8"
                      placeholder="Enter occurrence title..."
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Course of events (Note: do not write personal data)</Label>
                    <Textarea
                      value={formData.courseOfEvents}
                      onChange={(e) => updateFormData(prev => ({ ...prev, courseOfEvents: e.target.value }))}
                      className="w-full mt-1 min-h-[80px]"
                      placeholder="Describe the course of events..."
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Involved's opinion on the cause</Label>
                    <Textarea
                      value={formData.involvedOpinion}
                      onChange={(e) => updateFormData(prev => ({ ...prev, involvedOpinion: e.target.value }))}
                      className="w-full mt-1 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Involved's proposal on action or action performed</Label>
                    <Textarea
                      value={formData.involvedProposal}
                      onChange={(e) => updateFormData(prev => ({ ...prev, involvedProposal: e.target.value }))}
                      className="w-full mt-1 min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Operating situation</Label>
                      <Select 
                        value={formData.operatingSituation} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, operatingSituation: value }))}
                      >
                        <SelectTrigger className="w-full mt-1 h-8">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {OPERATING_SITUATION_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Injury risk</Label>
                      <Select>
                        <SelectTrigger className="w-full mt-1 h-8">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <Select>
                        <SelectTrigger className="w-full mt-1 h-8">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Object</Label>
                      <Select>
                        <SelectTrigger className="w-full mt-1 h-8">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Activity</Label>
                    <Select>
                      <SelectTrigger className="w-full mt-1 h-8">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Incident/categories</Label>
                      <Select 
                        value={formData.incidentCategories[0] || ''} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, incidentCategories: value ? [value] : [] }))}
                      >
                        <SelectTrigger className="w-full mt-1 h-8">
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LTI">LTI</SelectItem>
                          <SelectItem value="RWI">RWI</SelectItem>
                          <SelectItem value="MTI">MTI</SelectItem>
                          <SelectItem value="FAI">FAI</SelectItem>
                          <SelectItem value="NTI">NTI</SelectItem>
                          <SelectItem value="Near miss">Near miss</SelectItem>
                          <SelectItem value="Risk observation">Risk observation</SelectItem>
                          <SelectItem value="Environmental accident">Environmental accident</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Processing (Ctrl + click to select multiple items)</Label>
                      <Select>
                        <SelectTrigger className="w-full mt-1 h-8">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </Select>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Consequence Section - Only for accidents */}
          {formData.type === 'accident' && (
            <Accordion type="single" collapsible defaultValue="consequence" className="mb-4">
              <AccordionItem value="consequence">
                <AccordionTrigger className="text-base font-medium py-2">
                  <div className="flex items-center gap-2">
                    Consequence
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Sick leave</Label>
                      <Select 
                        value={formData.sickLeave || 'none'} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, sickLeave: value }))}
                      >
                        <SelectTrigger className="w-full h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="probably-1-3-days">Probably 1-3 Days</SelectItem>
                          <SelectItem value="probably-4-14-days">Probably 4-14 Days</SelectItem>
                          <SelectItem value="probably-over-14-days">Probably &gt;14 Days</SelectItem>
                          <SelectItem value="death">Death</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="jobTransferDays" className="text-sm font-medium">Job transfer or restriction (days)</Label>
                      <Input
                        id="jobTransferDays"
                        type="number"
                        value={formData.jobTransferDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, jobTransferDays: e.target.value }))}
                        placeholder=""
                        className="w-full h-8"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Permanent job transfer</Label>
                      <Select 
                        value={formData.permanentJobTransfer ? 'yes' : 'no'} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, permanentJobTransfer: value === 'yes' }))}
                      >
                        <SelectTrigger className="w-full h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Medically treated</Label>
                      <Select 
                        value={formData.medicallyTreated ? 'yes' : 'no'} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, medicallyTreated: value === 'yes' }))}
                      >
                        <SelectTrigger className="w-full h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Type of injury (Ctrl + click to select multiple items)</Label>
                      <Select>
                        <SelectTrigger className="w-full h-8">
                          <SelectValue placeholder={formData.injuryTypes.length > 0 ? `${formData.injuryTypes.length} selected` : "Select injury types..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {['Acoustic Trauma', 'Acute poisoning', 'Burn injury', 'Cut wound/Abrasion', 'Damage to the eye', 'Dental injury', 'Frostbite injury', 'Injury caused by corrosive material/substance', 'Injury to inner organs within abdomen, pelvis and/or chest', 'Injury to the brain and/or concussion', 'Loss of limb/other body part', 'Mental illness', 'Other', 'Skeletal injury', 'Soft tissue injury (e.g. crushed, mangled, pinched)', 'Sprain, strain or stretched ligament/tendon/etc', 'Unconsciousness'].map((type) => (
                            <div key={type} className="flex items-center space-x-2 px-2 py-1">
                              <Checkbox
                                id={`injury-${type}`}
                                checked={formData.injuryTypes.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData(prev => ({ ...prev, injuryTypes: [...prev.injuryTypes, type] }));
                                  } else {
                                    setFormData(prev => ({ ...prev, injuryTypes: prev.injuryTypes.filter(t => t !== type) }));
                                  }
                                }}
                              />
                              <Label htmlFor={`injury-${type}`} className="text-sm">{type}</Label>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Injured body part (Ctrl + click to select multiple items)</Label>
                      <Select>
                        <SelectTrigger className="w-full h-8">
                          <SelectValue placeholder={formData.injuredBodyParts.length > 0 ? `${formData.injuredBodyParts.length} selected` : "Select body parts..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {['Abdomen and pelvis', 'Arm', 'Back (not neck)', 'Chest', 'Ear', 'Elbow', 'Entire body', 'Eye', 'Face', 'Finger', 'Foot, ankle', 'Groin', 'Hand, wrist', 'Head (not face)', 'Hip, leg', 'Knee', 'Lungs', 'No injured body part', 'Respiratory passages', 'Shoulder', 'Throat, neck', 'Toe', 'Tooth, Teeth'].map((part) => (
                            <div key={part} className="flex items-center space-x-2 px-2 py-1">
                              <Checkbox
                                id={`body-${part}`}
                                checked={formData.injuredBodyParts.includes(part)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData(prev => ({ ...prev, injuredBodyParts: [...prev.injuredBodyParts, part] }));
                                  } else {
                                    setFormData(prev => ({ ...prev, injuredBodyParts: prev.injuredBodyParts.filter(p => p !== part) }));
                                  }
                                }}
                              />
                              <Label htmlFor={`body-${part}`} className="text-sm">{part}</Label>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          </fieldset>

          {/* Action Buttons */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <div className="flex items-center gap-2">
              {!isReadOnly && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      type="button"
                      className="bg-red-500 text-white hover:bg-red-600 h-8 border-red-500"
                    >
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Occurrence</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this occurrence? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete?.(occurrence?.id || '')}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!isReadOnly && hasUnsavedChanges && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      type="button"
                      variant="outline"
                      className="h-8"
                    >
                      Close
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                      <AlertDialogDescription>
                        You have unsaved changes. Are you sure you want to close without saving?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onCancel?.()}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Close without saving
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              
              {(isReadOnly || !hasUnsavedChanges) && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => onCancel?.()}
                  className="h-8"
                >
                  Close
                </Button>
              )}
              
              {!isReadOnly && (
                <Button 
                  type="submit"
                  className="bg-green-600 text-white hover:bg-green-700 h-8"
                >
                  Save
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
