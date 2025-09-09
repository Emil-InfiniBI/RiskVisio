import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Occurrence } from '@/types';

interface OccurrenceViewProps {
  occurrence: Occurrence;
  onClose: () => void;
}

function StatusBars({ status }: { status: Occurrence['status'] }) {
  const statusConfig: Record<Occurrence['status'], { bars: number; color: string; label: string }> = {
    'reported': { bars: 1, color: 'bg-gray-400', label: 'Reported' },
    'under-review': { bars: 2, color: 'bg-yellow-500', label: 'Under review' },
    'investigated': { bars: 3, color: 'bg-blue-500', label: 'Investigated' },
    'closed': { bars: 4, color: 'bg-green-500', label: 'Closed' }
  };
  const cfg = statusConfig[status] ?? statusConfig['reported'];
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={`w-3 h-4 ${i < cfg.bars ? cfg.color : 'bg-gray-200'}`} />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">{cfg.label}</span>
    </div>
  );
}

export function OccurrenceView({ occurrence, onClose }: OccurrenceViewProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="!max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="font-mono text-base">{occurrence.id}</span>
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{occurrence.factory}</Badge>
            <Badge>{new Date(occurrence.reportedDate).toLocaleDateString('sv-SE')} {occurrence.reportedTime}</Badge>
            <Badge variant="outline">{occurrence.type.replace('-', ' ')}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {occurrence.priority === 'critical' && <span className="text-red-500">!</span>}
              {occurrence.title || 'Untitled occurrence'}
            </h3>
            <StatusBars status={occurrence.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Reported by</div>
              <div>{occurrence.reportedByName || occurrence.reportedBy || '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Location</div>
              <div>{occurrence.location || '—'}</div>
            </div>
            {occurrence.reportedByEmail && (
              <div>
                <div className="text-muted-foreground">E-mail</div>
                <div>{occurrence.reportedByEmail}</div>
              </div>
            )}
            {occurrence.occurrenceManager && (
              <div>
                <div className="text-muted-foreground">Occurrence manager</div>
                <div>{occurrence.occurrenceManager}</div>
              </div>
            )}
          </div>

          {occurrence.description && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Description</div>
              <div className="text-sm whitespace-pre-wrap">{occurrence.description}</div>
            </div>
          )}

          {occurrence.courseOfEvents && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Course of events</div>
              <div className="text-sm whitespace-pre-wrap">{occurrence.courseOfEvents}</div>
            </div>
          )}

          {occurrence.involvedOpinion && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Involved's opinion</div>
              <div className="text-sm whitespace-pre-wrap">{occurrence.involvedOpinion}</div>
            </div>
          )}

          {occurrence.involvedProposal && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Involved's proposal</div>
              <div className="text-sm whitespace-pre-wrap">{occurrence.involvedProposal}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            {occurrence.operatingSituation && (
              <div>
                <div className="text-muted-foreground">Operating situation</div>
                <div>{occurrence.operatingSituation}</div>
              </div>
            )}
            {occurrence.injuryRisk && (
              <div>
                <div className="text-muted-foreground">Injury risk</div>
                <div>{occurrence.injuryRisk}</div>
              </div>
            )}
            {occurrence.incidentCategories && occurrence.incidentCategories.length > 0 && (
              <div>
                <div className="text-muted-foreground">Incident category</div>
                <div>{occurrence.incidentCategories.join(', ')}</div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OccurrenceView;
