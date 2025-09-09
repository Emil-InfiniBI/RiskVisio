import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Risk } from '@/types';
import { Edit, Trash2 } from 'lucide-react';

interface RiskListProps {
  risks: Risk[];
  onEdit?: (risk: Risk) => void;
  onDelete?: (id: string) => void;
}

export function RiskList({ risks, onEdit, onDelete }: RiskListProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 20) return { level: 'Critical', color: 'bg-destructive' };
    if (score >= 15) return { level: 'High', color: 'bg-accent' };
    if (score >= 10) return { level: 'Medium', color: 'bg-yellow-500' };
    if (score >= 5) return { level: 'Low', color: 'bg-green-500' };
    return { level: 'Very Low', color: 'bg-green-600' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed': return 'bg-green-500';
      case 'identified': return 'bg-destructive';
      case 'assessed': case 'monitored': return 'bg-blue-500';
      case 'treated': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const isOverdue = (reviewDate: string) => {
    return new Date(reviewDate) < new Date();
  };

  if (risks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No risks identified yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Risk Matrix Summary */}
      <Card className="w-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Risk Heat Map</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-6 gap-0.5 mb-2 w-fit">
            <div></div>
            <div className="text-center text-[10px] font-medium w-6">1</div>
            <div className="text-center text-[10px] font-medium w-6">2</div>
            <div className="text-center text-[10px] font-medium w-6">3</div>
            <div className="text-center text-[10px] font-medium w-6">4</div>
            <div className="text-center text-[10px] font-medium w-6">5</div>
            
            {[5, 4, 3, 2, 1].map(impact => (
              [impact].concat([1, 2, 3, 4, 5].map(probability => {
                const score = probability * impact;
                const riskLevel = getRiskLevel(score);
                const count = risks.filter(r => r.probability === probability && r.impact === impact).length;
                
                return (
                  <div
                    key={`${probability}-${impact}`}
                    className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold text-white rounded ${riskLevel.color} ${count > 0 ? 'ring-1 ring-primary' : ''}`}
                  >
                    {count > 0 ? count : ''}
                  </div>
                );
              })).map((cell, index) => 
                index === 0 ? (
                  <div key={`impact-${impact}`} className="flex items-center justify-center text-[10px] font-medium w-6">
                    {impact}
                  </div>
                ) : cell
              )
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground text-center">
            Probability → | ↑ Impact
          </div>
        </CardContent>
      </Card>

      {/* Risk List */}
      <div className="grid gap-4">
        {risks.map((risk) => {
          const riskLevel = getRiskLevel(risk.riskScore);
          const overdue = isOverdue(risk.reviewDate);
          
          return (
            <Card key={risk.id} className={overdue ? 'border-destructive' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 flex items-center">
                      {risk.title}
                      {overdue && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Review Overdue
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="font-medium text-primary">[{risk.factory}]</span>
                      <span>Owner: {risk.owner}</span>
                      <span>Category: {risk.category}</span>
                      <span>Review: {risk.reviewDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={riskLevel.color}>
                      {risk.riskScore} - {riskLevel.level}
                    </Badge>
                    <Badge className={getStatusColor(risk.status)}>
                      {risk.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{risk.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Probability: {risk.probability}/5</p>
                    <Progress value={risk.probability * 20} className="h-2" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Impact: {risk.impact}/5</p>
                    <Progress value={risk.impact * 20} className="h-2" />
                  </div>
                </div>

                {risk.targetRiskScore && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">
                      Target Risk Score: {risk.targetRiskScore} 
                      {risk.riskScore <= risk.targetRiskScore ? 
                        <Badge className="ml-2 bg-green-500">Target Met</Badge> : 
                        <Badge className="ml-2 bg-yellow-500">In Progress</Badge>
                      }
                    </p>
                  </div>
                )}

                {risk.mitigationStrategy && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">Mitigation Strategy:</p>
                    <p className="text-sm text-muted-foreground">{risk.mitigationStrategy}</p>
                  </div>
                )}

                {risk.currentControls.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Current Controls:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {risk.currentControls.map((control, index) => (
                        <li key={index}>{control}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(risk)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(risk.id)}
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