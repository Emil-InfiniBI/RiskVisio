import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Incident } from '@/types';
import { Edit, Trash2, Search } from 'lucide-react';

interface IncidentListProps {
  incidents: Incident[];
  onEdit?: (incident: Incident) => void;
  onDelete?: (id: string) => void;
  onInvestigate: (incident: Incident) => void;
  getSeverityColor: (severity: string) => string;
  getStatusColor: (status: string) => string;
}

export function IncidentList({ 
  incidents, 
  onEdit, 
  onDelete, 
  onInvestigate,
  getSeverityColor, 
  getStatusColor 
}: IncidentListProps) {
  if (incidents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No incidents reported yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {incidents.map((incident) => (
        <Card key={incident.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">{incident.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="font-medium text-primary">[{incident.factory}]</span>
                  <span>Reported by: {incident.reportedBy}</span>
                  <span>Date: {incident.reportedDate}</span>
                  <span>Location: {incident.location}</span>
                  {incident.assignedTo && <span>Assigned to: {incident.assignedTo}</span>}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getSeverityColor(incident.severity)}>
                  {incident.severity}
                </Badge>
                <Badge className={getStatusColor(incident.status)}>
                  {incident.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">{incident.description}</p>
            
            {incident.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {incident.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {incident.rootCause && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-1">Root Cause:</p>
                <p className="text-sm text-muted-foreground">{incident.rootCause}</p>
              </div>
            )}

            {incident.actions.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-1">Actions Taken:</p>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {incident.actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onInvestigate(incident)}
              >
                <Search className="h-4 w-4 mr-1" />
                Investigate
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(incident)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(incident.id)}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}