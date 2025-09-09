import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';
import { ComplianceItem, Factory, User } from '@/types';

interface ComplianceFormProps {
  compliance?: ComplianceItem;
  onSubmit: (compliance: ComplianceItem) => void;
  onClose: () => void;
  currentUser?: User;
  currentFactory?: Factory;
}

// Compliance Form Component
export function ComplianceForm({ compliance, onSubmit, onClose, currentUser, currentFactory }: ComplianceFormProps) {
  // Get available factories based on user permissions
  const getAvailableFactories = (): Factory[] => {
    const allFactories: Factory[] = ['BTL', 'BTO', 'BTI', 'BTX', 'BTT', 'BTG'];
    if (!currentUser) return allFactories;
    if (currentUser.role === 'admin') return allFactories;
    return currentUser.factories;
  };

  const availableFactories = getAvailableFactories();
  
  const [formData, setFormData] = useState<Partial<ComplianceItem>>({
    id: compliance?.id || '',
    requirement: compliance?.requirement || '',
    regulation: compliance?.regulation || '',
    description: compliance?.description || '',
    status: compliance?.status || 'under-review',
    priority: compliance?.priority || 'medium',
    owner: compliance?.owner || '',
    factory: compliance?.factory || currentFactory || (availableFactories.length > 0 ? availableFactories[0] : 'BTL'),
    dueDate: compliance?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lastAssessed: compliance?.lastAssessed || new Date().toISOString().split('T')[0],
    evidence: compliance?.evidence || [],
    actions: compliance?.actions || [],
    notes: compliance?.notes || ''
  });

  const [newEvidence, setNewEvidence] = useState('');
  const [newAction, setNewAction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const complianceData: ComplianceItem = {
      id: formData.id || Date.now().toString(),
      requirement: formData.requirement!,
      regulation: formData.regulation!,
      description: formData.description!,
      status: formData.status!,
      priority: formData.priority!,
      owner: formData.owner!,
      factory: formData.factory!,
      dueDate: formData.dueDate!,
      lastAssessed: formData.lastAssessed!,
      evidence: formData.evidence!,
      actions: formData.actions!,
      notes: formData.notes!
    };

    onSubmit(complianceData);
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {compliance ? 'Edit Compliance Requirement' : 'Add Compliance Requirement'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requirement">Requirement</Label>
              <Input
                id="requirement"
                value={formData.requirement}
                onChange={(e) => setFormData(prev => ({ ...prev, requirement: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="regulation">Regulation/Standard</Label>
              <Input
                id="regulation"
                value={formData.regulation}
                onChange={(e) => setFormData(prev => ({ ...prev, regulation: e.target.value }))}
                required
                placeholder="e.g., ISO 27001, GDPR, OSHA"
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
              <Label htmlFor="status">Compliance Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                  <SelectItem value="partial">Partially Compliant</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="owner">Owner</Label>
              <Input
                id="owner"
                value={formData.owner}
                onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastAssessed">Last Assessed</Label>
              <Input
                id="lastAssessed"
                type="date"
                value={formData.lastAssessed}
                onChange={(e) => setFormData(prev => ({ ...prev, lastAssessed: e.target.value }))}
                required
              />
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

          <div>
            <Label>Corrective Actions</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                placeholder="Add action item..."
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
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {compliance ? 'Update Compliance' : 'Add Compliance'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}