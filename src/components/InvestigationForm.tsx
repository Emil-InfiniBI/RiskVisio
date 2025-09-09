import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Investigation, Incident, Factory } from '@/types';

interface InvestigationFormProps {
  incidents: Incident[];
  incident?: Incident;
  onSubmit: (investigation: Investigation) => void;
  onClose: () => void;
}

export function InvestigationForm({ incidents, incident, onSubmit, onClose }: InvestigationFormProps) {
  const selectedIncident = incidents.find(i => i.id === incident?.id);
  
  const [formData, setFormData] = useState<Partial<Investigation>>({
    id: '',
    incidentId: incident?.id || '',
    investigator: '',
    factory: selectedIncident?.factory || 'BTL',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'open',
    findings: '',
    rootCause: '',
    recommendations: [],
    evidence: [],
    timeline: []
  });

  const [newRecommendation, setNewRecommendation] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [newTimelineEvent, setNewTimelineEvent] = useState('');
  const [newTimelineDetails, setNewTimelineDetails] = useState('');
  const [newTimelineDate, setNewTimelineDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const investigationData: Investigation = {
      id: Date.now().toString(),
      incidentId: formData.incidentId!,
      investigator: formData.investigator!,
      factory: formData.factory!,
      startDate: formData.startDate!,
      endDate: formData.endDate,
      status: formData.status!,
      findings: formData.findings!,
      rootCause: formData.rootCause!,
      recommendations: formData.recommendations!,
      evidence: formData.evidence!,
      timeline: formData.timeline!
    };

    onSubmit(investigationData);
  };

  const addRecommendation = () => {
    if (newRecommendation) {
      setFormData(prev => ({
        ...prev,
        recommendations: [...(prev.recommendations || []), newRecommendation]
      }));
      setNewRecommendation('');
    }
  };

  const removeRecommendation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recommendations: prev.recommendations?.filter((_, i) => i !== index) || []
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

  const addTimelineEvent = () => {
    if (newTimelineEvent && newTimelineDetails && newTimelineDate) {
      setFormData(prev => ({
        ...prev,
        timeline: [...(prev.timeline || []), {
          date: newTimelineDate,
          event: newTimelineEvent,
          details: newTimelineDetails
        }]
      }));
      setNewTimelineEvent('');
      setNewTimelineDetails('');
      setNewTimelineDate(new Date().toISOString().split('T')[0]);
    }
  };

  const removeTimelineEvent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      timeline: prev.timeline?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start Investigation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="incidentId">Incident</Label>
              <Select
                value={formData.incidentId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, incidentId: value }))}
                disabled={!!incident}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select incident to investigate" />
                </SelectTrigger>
                <SelectContent>
                  {incidents.map((inc) => (
                    <SelectItem key={inc.id} value={inc.id}>
                      {inc.title} - {inc.severity} ({inc.reportedDate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="investigator">Lead Investigator</Label>
              <Input
                id="investigator"
                value={formData.investigator}
                onChange={(e) => setFormData(prev => ({ ...prev, investigator: e.target.value }))}
                required
              />
            </div>
          </div>

          {selectedIncident && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Incident Details</h4>
              <div className="text-sm space-y-1">
                <p><strong>Title:</strong> {selectedIncident.title}</p>
                <p><strong>Description:</strong> {selectedIncident.description}</p>
                <p><strong>Type:</strong> {selectedIncident.type} | <strong>Severity:</strong> {selectedIncident.severity}</p>
                <p><strong>Location:</strong> {selectedIncident.location} | <strong>Reported:</strong> {selectedIncident.reportedDate}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Investigation Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">Target End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
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
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="findings">Initial Findings</Label>
            <Textarea
              id="findings"
              value={formData.findings}
              onChange={(e) => setFormData(prev => ({ ...prev, findings: e.target.value }))}
              rows={3}
              placeholder="Document preliminary findings and observations..."
            />
          </div>

          <div>
            <Label htmlFor="rootCause">Root Cause Analysis</Label>
            <Textarea
              id="rootCause"
              value={formData.rootCause}
              onChange={(e) => setFormData(prev => ({ ...prev, rootCause: e.target.value }))}
              rows={3}
              placeholder="Identify and document the root cause(s)..."
            />
          </div>

          <div>
            <Label>Timeline of Events</Label>
            <div className="grid grid-cols-12 gap-2 mb-2">
              <div className="col-span-3">
                <Input
                  type="date"
                  value={newTimelineDate}
                  onChange={(e) => setNewTimelineDate(e.target.value)}
                  placeholder="Date"
                />
              </div>
              <div className="col-span-4">
                <Input
                  value={newTimelineEvent}
                  onChange={(e) => setNewTimelineEvent(e.target.value)}
                  placeholder="Event"
                />
              </div>
              <div className="col-span-4">
                <Input
                  value={newTimelineDetails}
                  onChange={(e) => setNewTimelineDetails(e.target.value)}
                  placeholder="Details"
                />
              </div>
              <div className="col-span-1">
                <Button type="button" onClick={addTimelineEvent} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {formData.timeline?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((event, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-3 rounded">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-xs">
                        {event.date}
                      </Badge>
                      <span className="font-medium">{event.event}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{event.details}</p>
                  </div>
                  <X
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                    onClick={() => removeTimelineEvent(index)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Evidence Collected</Label>
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
                  <X
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                    onClick={() => removeEvidence(index)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Recommendations</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newRecommendation}
                onChange={(e) => setNewRecommendation(e.target.value)}
                placeholder="Add recommendation..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecommendation())}
              />
              <Button type="button" onClick={addRecommendation}>Add</Button>
            </div>
            <div className="space-y-1">
              {formData.recommendations?.map((recommendation, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span className="text-sm">{recommendation}</span>
                  <X
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                    onClick={() => removeRecommendation(index)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Start Investigation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}