import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Occurrence } from '@/types';

interface OccurrenceListProps {
  occurrences: Occurrence[];
  onEdit?: (occurrence: Occurrence) => void;
  onDelete?: (id: string) => void;
  onView?: (occurrence: Occurrence) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

const getTypeLabel = (type: Occurrence['type']): string => {
  const typeLabels = {
    'risk-observation': 'Risk observation',
    'near-miss': 'Near miss',
    'accident': 'Accident',
    'commuting-accident': 'Commuting accident',
    'work-related-illness': 'Work-related illness',
    'environment': 'Environment',
    'improvement-proposal': 'Improvement proposal'
  };
  return typeLabels[type] || type;
};

const getStatusBars = (status: Occurrence['status']) => {
  const statusConfig = {
    'reported': { bars: 1, color: 'bg-gray-400' },
    'under-review': { bars: 2, color: 'bg-yellow-500' },
    'investigated': { bars: 3, color: 'bg-blue-500' },
    'closed': { bars: 4, color: 'bg-green-500' }
  };
  
  const config = statusConfig[status] || { bars: 1, color: 'bg-gray-400' };
  
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className={`w-3 h-4 ${i < config.bars ? config.color : 'bg-gray-200'}`}
        />
      ))}
    </div>
  );
};

export function OccurrenceList({ 
  occurrences, 
  onEdit, 
  onDelete, 
  onView,
  getPriorityColor, 
  getStatusColor 
}: OccurrenceListProps) {
  if (occurrences.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No occurrences reported yet.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">ID</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Injured/Person reporting</TableHead>
            <TableHead className="font-semibold">Unit</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {occurrences.map((occurrence, index) => (
            <TableRow 
              key={occurrence.id} 
              className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
            >
              <TableCell className="font-mono text-sm">
                {occurrence.id}
              </TableCell>
              
              <TableCell className="text-sm">
                {new Date(occurrence.reportedDate).toLocaleDateString('sv-SE')}
              </TableCell>
              
              <TableCell>
                {getStatusBars(occurrence.status)}
              </TableCell>
              
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {occurrence.priority === 'critical' && (
                    <span className="text-red-500 font-bold">!</span>
                  )}
                  {occurrence.title}
                </div>
              </TableCell>
              
              <TableCell className="text-sm">
                {occurrence.reportedByName || occurrence.reportedBy}
              </TableCell>
              
              <TableCell className="text-sm">
                {occurrence.location || 'Not specified'}
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  {getTypeLabel(occurrence.type)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-1">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(occurrence)}
                      title="View details"
                      className="h-8 w-8 p-0"
                    >
                      👁️
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(occurrence)}
                      title="Edit occurrence"
                      className="h-8 w-8 p-0"
                    >
                      ✏️
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(occurrence.id)}
                      title="Delete occurrence"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      🗑️
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}