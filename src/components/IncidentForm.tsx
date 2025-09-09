import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';
import { Incident, Factory, User } from '@/types';

interface IncidentFormProps {
  incident?: Incident;
  onSubmit: (incident: Incident) => void;
  onClose: () => void;
  currentUser?: User;
  currentFactory?: Factory;
}

// Incident Form Component
export function IncidentForm({ incident, onSubmit, onClose, currentUser, currentFactory }: IncidentFormProps) {
  // Get available factories based on user permissions
  const getAvailableFactories = (): Factory[] => {
    const allFactories: Factory[] = ['BTL', 'BTO', 'BTI', 'BTX', 'BTT', 'BTG'];
    if (!currentUser) return allFactories;
    if (currentUser.role === 'admin') return allFactories;
    return currentUser.factories;
  };

  const availableFactories = getAvailableFactories();
  
  const [formData, setFormData] = useState<Partial<Incident>>({
    id: incident?.id || '',
    title: incident?.title || '',
    description: incident?.description || '',
    type: incident?.type || 'operational',
    severity: incident?.severity || 'medium',
    status: incident?.status || 'reported',
    reportedBy: incident?.reportedBy || '',
    reportedDate: incident?.reportedDate || new Date().toISOString().split('T')[0],
    assignedTo: incident?.assignedTo || '',
    factory: incident?.factory || currentFactory || (availableFactories.length > 0 ? availableFactories[0] : 'BTL'),
    location: incident?.location || '',
    tags: incident?.tags || [],
    rootCause: incident?.rootCause || '',
    actions: incident?.actions || [],
    evidence: incident?.evidence || []
  });

  const [newTag, setNewTag] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newEvidence, setNewEvidence] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const incidentData: Incident = {
      id: formData.id || Date.now().toString(),
      title: formData.title!,
      description: formData.description!,
      type: formData.type!,
      severity: formData.severity!,
      status: formData.status!,
      reportedBy: formData.reportedBy!,
      reportedDate: formData.reportedDate!,
      assignedTo: formData.assignedTo,
      factory: formData.factory!,
      location: formData.location!,
      tags: formData.tags!,
      rootCause: formData.rootCause,
      actions: formData.actions!,
      evidence: formData.evidence!
    };

    onSubmit(incidentData);
  };

  const addTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addAction = () => {
    if (newAction) {
      setFormData(prev => ({
        ...prev,
        actions: [...(prev.actions || []), newAction]
      }));
      setNewAction('');
    }
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index) || []
    }));
  };

  const addEvidence = () => {
    if (newEvidence) {
      setFormData(prev => ({
        ...prev,
        evidence: [...(prev.evidence || []), newEvidence]
      }));
      setNewEvidence('');
    }
  };

  const removeEvidence = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {incident ? 'Edit Incident' : 'Report New Incident'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Incident Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="reportedBy">Reported By</Label>
              <Input
                id="reportedBy"
                value={formData.reportedBy}
                onChange={(e) => setFormData(prev => ({ ...prev, reportedBy: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="factory">Factory</Label>
              <Select
                value={formData.factory}
                onValueChange={(value) => setFormData(prev => ({ ...prev, factory: value as Factory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableFactories.map(factory => (
                    <SelectItem key={factory} value={factory}>{factory}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportedDate">Reported Date</Label>
              <Input
                id="reportedDate"
                type="date"
                value={formData.reportedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, reportedDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer">
                  {tag}
                  <span
                    className="ml-1 cursor-pointer text-sm"
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </span>
                </Badge>
              ))}
            </div>
          </div>

          {formData.status !== 'reported' && (
            <div>
              <Label htmlFor="rootCause">Root Cause Analysis</Label>
              <Textarea
                id="rootCause"
                value={formData.rootCause}
                onChange={(e) => setFormData(prev => ({ ...prev, rootCause: e.target.value }))}
                rows={2}
              />
            </div>
          )}

          <div>
            <Label>Corrective Actions</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                placeholder="Add action..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAction())}
              />
              <Button type="button" onClick={addAction}>Add</Button>
            </div>
            <div className="space-y-1">
              {formData.actions?.map((action, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span className="text-sm">{action}</span>
                  <span
                    className="cursor-pointer text-muted-foreground hover:text-destructive text-lg"
                    onClick={() => removeAction(index)}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Evidence/Documentation</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newEvidence}
                onChange={(e) => setNewEvidence(e.target.value)}
                placeholder="Add evidence reference..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEvidence())}
              />
              <Button type="button" onClick={addEvidence}>Add</Button>
            </div>
            <div className="space-y-1">
              {formData.evidence?.map((evidence, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span className="text-sm">{evidence}</span>
                  <span
                    className="cursor-pointer text-muted-foreground hover:text-destructive text-lg"
                    onClick={() => removeEvidence(index)}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {incident ? 'Update Incident' : 'Report Incident'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}