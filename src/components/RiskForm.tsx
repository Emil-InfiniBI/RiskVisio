import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';
import { Risk, Factory, User } from '@/types';

interface RiskFormProps {
  risk?: Risk;
  onSubmit: (risk: Risk) => void;
  onClose: () => void;
  currentUser?: User;
  currentFactory?: Factory;
}

// Risk Form Component  
export function RiskForm({ risk, onSubmit, onClose, currentUser, currentFactory }: RiskFormProps) {
  // Get available factories based on user permissions
  const getAvailableFactories = (): Factory[] => {
    const allFactories: Factory[] = ['BTL', 'BTO', 'BTI', 'BTX', 'BTT', 'BTG'];
    if (!currentUser) return allFactories;
    if (currentUser.role === 'admin') return allFactories;
    return currentUser.factories;
  };

  const availableFactories = getAvailableFactories();
  
  const [formData, setFormData] = useState<Partial<Risk>>({
    id: risk?.id || '',
    title: risk?.title || '',
    description: risk?.description || '',
    category: risk?.category || 'operational',
    probability: risk?.probability || 3,
    impact: risk?.impact || 3,
    riskScore: risk?.riskScore || 9,
    status: risk?.status || 'identified',
    owner: risk?.owner || '',
    factory: risk?.factory || currentFactory || (availableFactories.length > 0 ? availableFactories[0] : 'BTL'),
    identifiedDate: risk?.identifiedDate || new Date().toISOString().split('T')[0],
    reviewDate: risk?.reviewDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    mitigationStrategy: risk?.mitigationStrategy || '',
    currentControls: risk?.currentControls || [],
    targetRiskScore: risk?.targetRiskScore
  });

  const [newControl, setNewControl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const riskData: Risk = {
      id: formData.id || Date.now().toString(),
      title: formData.title!,
      description: formData.description!,
      category: formData.category!,
      probability: formData.probability!,
      impact: formData.impact!,
      riskScore: formData.probability! * formData.impact!,
      status: formData.status!,
      owner: formData.owner!,
      factory: formData.factory!,
      identifiedDate: formData.identifiedDate!,
      reviewDate: formData.reviewDate!,
      mitigationStrategy: formData.mitigationStrategy!,
      currentControls: formData.currentControls!,
      targetRiskScore: formData.targetRiskScore
    };

    onSubmit(riskData);
  };

  const updateRiskScore = (probability?: number, impact?: number) => {
    const newProbability = probability ?? formData.probability!;
    const newImpact = impact ?? formData.impact!;
    const newRiskScore = newProbability * newImpact;
    
    setFormData(prev => ({
      ...prev,
      probability: newProbability,
      impact: newImpact,
      riskScore: newRiskScore
    }));
  };

  const addControl = () => {
    if (newControl) {
      setFormData(prev => ({
        ...prev,
        currentControls: [...(prev.currentControls || []), newControl]
      }));
      setNewControl('');
    }
  };

  const removeControl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      currentControls: prev.currentControls?.filter((_, i) => i !== index) || []
    }));
  };

  const getRiskLevel = (score: number) => {
    if (score >= 20) return { level: 'Critical', color: 'bg-destructive' };
    if (score >= 15) return { level: 'High', color: 'bg-accent' };
    if (score >= 10) return { level: 'Medium', color: 'bg-yellow-500' };
    if (score >= 5) return { level: 'Low', color: 'bg-green-500' };
    return { level: 'Very Low', color: 'bg-green-600' };
  };

  const currentRiskLevel = getRiskLevel(formData.riskScore || 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {risk ? 'Edit Risk' : 'Add New Risk'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Risk Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Risk Description</Label>
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
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="reputational">Reputational</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
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
                  <SelectItem value="identified">Identified</SelectItem>
                  <SelectItem value="assessed">Assessed</SelectItem>
                  <SelectItem value="treated">Treated</SelectItem>
                  <SelectItem value="monitored">Monitored</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
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
              <Label htmlFor="probability">Probability (1-5)</Label>
              <Select
                value={formData.probability?.toString()}
                onValueChange={(value) => updateRiskScore(parseInt(value), undefined)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="impact">Impact (1-5)</Label>
              <Select
                value={formData.impact?.toString()}
                onValueChange={(value) => updateRiskScore(undefined, parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Minimal</SelectItem>
                  <SelectItem value="2">2 - Minor</SelectItem>
                  <SelectItem value="3">3 - Moderate</SelectItem>
                  <SelectItem value="4">4 - Major</SelectItem>
                  <SelectItem value="5">5 - Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Risk Score</Label>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-2xl font-bold">{formData.riskScore}</span>
                <Badge className={currentRiskLevel.color}>
                  {currentRiskLevel.level}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="owner">Risk Owner</Label>
              <Input
                id="owner"
                value={formData.owner}
                onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="identifiedDate">Identified Date</Label>
              <Input
                id="identifiedDate"
                type="date"
                value={formData.identifiedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, identifiedDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="reviewDate">Next Review Date</Label>
              <Input
                id="reviewDate"
                type="date"
                value={formData.reviewDate}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="mitigationStrategy">Mitigation Strategy</Label>
            <Textarea
              id="mitigationStrategy"
              value={formData.mitigationStrategy}
              onChange={(e) => setFormData(prev => ({ ...prev, mitigationStrategy: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label>Current Controls</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newControl}
                onChange={(e) => setNewControl(e.target.value)}
                placeholder="Add control measure..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addControl())}
              />
              <Button type="button" onClick={addControl}>Add</Button>
            </div>
            <div className="space-y-1">
              {formData.currentControls?.map((control, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span className="text-sm">{control}</span>
                  <span
                    className="cursor-pointer text-muted-foreground hover:text-destructive text-lg"
                    onClick={() => removeControl(index)}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="targetRiskScore">Target Risk Score (Optional)</Label>
            <Input
              id="targetRiskScore"
              type="number"
              min="1"
              max="25"
              value={formData.targetRiskScore || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                targetRiskScore: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {risk ? 'Update Risk' : 'Add Risk'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}