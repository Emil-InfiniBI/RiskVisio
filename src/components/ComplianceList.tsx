import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ComplianceItem } from '@/types';
import { Edit, Trash2, Calendar, AlertTriangle } from 'lucide-react';

interface ComplianceListProps {
  compliance: ComplianceItem[];
  onEdit?: (compliance: ComplianceItem) => void;
  onDelete?: (id: string) => void;
  getStatusColor: (status: string) => string;
}

export function ComplianceList({ compliance, onEdit, onDelete, getStatusColor }: ComplianceListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive';
      case 'high': return 'bg-accent';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const complianceStats = {
    compliant: compliance.filter(c => c.status === 'compliant').length,
    nonCompliant: compliance.filter(c => c.status === 'non-compliant').length,
    partial: compliance.filter(c => c.status === 'partial').length,
    underReview: compliance.filter(c => c.status === 'under-review').length,
    overdue: compliance.filter(c => isOverdue(c.dueDate) && c.status !== 'compliant').length
  };

  const complianceRate = compliance.length > 0 ? 
    (complianceStats.compliant / compliance.length) * 100 : 0;

  if (compliance.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No compliance requirements defined yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-2xl font-bold">{complianceRate.toFixed(1)}%</span>
                <span className="text-sm text-muted-foreground">
                  {complianceStats.compliant} of {compliance.length} compliant
                </span>
              </div>
              <Progress value={complianceRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Compliant:</span>
                <Badge className="bg-green-500">{complianceStats.compliant}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Non-Compliant:</span>
                <Badge className="bg-destructive">{complianceStats.nonCompliant}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Partial:</span>
                <Badge className="bg-yellow-500">{complianceStats.partial}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Under Review:</span>
                <Badge className="bg-blue-500">{complianceStats.underReview}</Badge>
              </div>
            </div>
            {complianceStats.overdue > 0 && (
              <div className="mt-3 p-2 bg-destructive/10 rounded-md flex items-center">
                <AlertTriangle className="h-4 w-4 text-destructive mr-2" />
                <span className="text-sm text-destructive font-medium">
                  {complianceStats.overdue} overdue requirements
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compliance List */}
      <div className="grid gap-4">
        {compliance.map((item) => {
          const overdue = isOverdue(item.dueDate);
          const daysUntilDue = getDaysUntilDue(item.dueDate);
          const isUrgent = daysUntilDue <= 7 && daysUntilDue > 0;
          
          return (
            <Card key={item.id} className={overdue ? 'border-destructive' : isUrgent ? 'border-accent' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 flex items-center">
                      {item.requirement}
                      {overdue && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Overdue
                        </Badge>
                      )}
                      {isUrgent && !overdue && (
                        <Badge className="ml-2 text-xs bg-accent">
                          Due Soon
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="font-medium text-primary">[{item.factory}]</span>
                      <span>Regulation: {item.regulation}</span>
                      <span>Owner: {item.owner}</span>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Due: {item.dueDate}</span>
                        {daysUntilDue > 0 && (
                          <span className="ml-1">({daysUntilDue} days)</span>
                        )}
                        {daysUntilDue < 0 && (
                          <span className="ml-1 text-destructive">({Math.abs(daysUntilDue)} days overdue)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{item.description}</p>
                
                <div className="mb-4 text-sm">
                  <span className="font-medium">Last Assessed:</span> {item.lastAssessed}
                </div>

                {item.evidence.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Evidence:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {item.evidence.map((evidence, index) => (
                        <li key={index}>{evidence}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.actions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Required Actions:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {item.actions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">Notes:</p>
                    <p className="text-sm text-muted-foreground">{item.notes}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(item)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}