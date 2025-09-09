import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Incident, Risk, ComplianceItem, Investigation, Occurrence } from '@/types';
import { AlertTriangle, Shield, FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DashboardProps {
  incidents: Incident[];
  risks: Risk[];
  compliance: ComplianceItem[];
  investigations: Investigation[];
  occurrences?: Occurrence[];
}

export function Dashboard({ incidents, risks, compliance, investigations, occurrences = [] }: DashboardProps) {
  // Days since last accident
  const accidentOccurrences = Array.isArray(occurrences) ? occurrences.filter(o => o.type && o.type.toLowerCase() === 'accident') : [];
  const lastAccidentDate = accidentOccurrences.length > 0
    ? accidentOccurrences.map(o => new Date(o.reportedDate)).sort((a, b) => b.getTime() - a.getTime())[0]
    : null;
  const daysSinceLastAccident = lastAccidentDate
    ? Math.floor((Date.now() - lastAccidentDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const lastMonth = new Date(currentYear, currentMonth - 1);
  const lastMonthIncidents = incidents.filter(i => {
    const incidentDate = new Date(i.reportedDate);
    return incidentDate.getMonth() === lastMonth.getMonth() && 
           incidentDate.getFullYear() === lastMonth.getFullYear();
  });

  const thisMonthIncidents = incidents.filter(i => {
    const incidentDate = new Date(i.reportedDate);
    return incidentDate.getMonth() === currentMonth && 
           incidentDate.getFullYear() === currentYear;
  });

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return { icon: Minus, color: 'text-muted-foreground' };
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return { icon: TrendingUp, color: 'text-destructive' };
    if (change < -5) return { icon: TrendingDown, color: 'text-green-500' };
    return { icon: Minus, color: 'text-muted-foreground' };
  };

  const incidentTrend = getTrend(thisMonthIncidents.length, lastMonthIncidents.length);

  const highRisks = risks.filter(r => r.riskScore >= 15);
  const criticalIncidents = incidents.filter(i => i.severity === 'critical');
  const overdueCompliance = compliance.filter(c => 
    new Date(c.dueDate) < new Date() && c.status !== 'compliant'
  );
  const activeInvestigations = investigations.filter(inv => inv.status !== 'completed');

  const complianceRate = compliance.length > 0 ? 
    (compliance.filter(c => c.status === 'compliant').length / compliance.length) * 100 : 0;

  // (Removed incidentsByType & severity breakdown cards per request)

  // Derive incident-like and risk-like items directly from occurrences
  // Assumptions:
  //  - Incident occurrences include operational / safety event types (accident, commuting-accident, work-related-illness, near-miss, environment)
  //  - Risk list for the dashboard "Recent Risks" card should reflect newly reported risk observations (type === 'risk-observation')
  // (We leave existing risk exposure metrics based on the dedicated risks list for now.)
  // Treat only actual incident outcome types (exclude near-miss which is a leading indicator)
  const incidentTypeSet = new Set([
    'accident',
    'commuting-accident',
    'work-related-illness',
    'environment'
  ]);

  const incidentOccurrencesAll = occurrences.filter(o => incidentTypeSet.has(o.type));
  const riskObservationOccurrences = occurrences.filter(o => o.type === 'risk-observation');

  const recentIncidentOccurrences = incidentOccurrencesAll
    .slice()
    .sort((a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime())
    .slice(0, 5);

  const recentRiskOccurrences = riskObservationOccurrences
    .slice()
    .sort((a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime())
    .slice(0, 5);

  const nearMissOccurrences = occurrences
    .filter(o => o.type === 'near-miss')
    .sort((a, b) => new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime())
    .slice(0, 5);

  // (Removed occurrencesByType aggregation as dashboard now shows explicit cards)

  return (
    <div className="space-y-6">
      {/* Alerts and High Priority Items */}
      {(criticalIncidents.length > 0 || overdueCompliance.length > 0 || highRisks.length > 0) && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Immediate Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalIncidents.length > 0 && (
                <div className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                  <span className="text-sm font-medium">{criticalIncidents.length} Critical Incidents</span>
                  <Badge className="bg-destructive">Action Required</Badge>
                </div>
              )}
              {overdueCompliance.length > 0 && (
                <div className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                  <span className="text-sm font-medium">{overdueCompliance.length} Overdue Compliance Items</span>
                  <Badge className="bg-destructive">Overdue</Badge>
                </div>
              )}
              {highRisks.length > 0 && (
                <div className="flex items-center justify-between p-2 bg-accent/10 rounded">
                  <span className="text-sm font-medium">{highRisks.length} High-Risk Items</span>
                  <Badge className="bg-accent">Monitor</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className={"relative overflow-hidden border-2 " + (daysSinceLastAccident === null ? 'border-muted' : daysSinceLastAccident >= 30 ? 'border-green-500' : daysSinceLastAccident >= 7 ? 'border-yellow-500' : 'border-destructive')}> 
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-br from-green-400 via-amber-300 to-red-400 mix-blend-multiply" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="inline-flex items-center justify-center rounded-full h-6 w-6 text-xs font-semibold bg-primary/10 text-primary">
                {daysSinceLastAccident !== null ? '⏱️' : 'ℹ️'}
              </span>
              Days Since Last Accident
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-baseline gap-2">
              <span className={"text-4xl font-extrabold tracking-tight " + (daysSinceLastAccident === null ? 'text-muted-foreground' : daysSinceLastAccident >= 30 ? 'text-green-600' : daysSinceLastAccident >= 7 ? 'text-yellow-600' : 'text-destructive')}>
                {daysSinceLastAccident !== null ? daysSinceLastAccident : '—'}
              </span>
              {daysSinceLastAccident !== null && <span className="text-xs font-medium uppercase text-muted-foreground">days</span>}
            </div>
            <p className="text-xs mt-1 font-medium">
              {daysSinceLastAccident === null && 'No accidents recorded yet'}
              {daysSinceLastAccident !== null && daysSinceLastAccident < 7 && 'Recent accident – focus on prevention'}
              {daysSinceLastAccident !== null && daysSinceLastAccident >= 7 && daysSinceLastAccident < 30 && 'Good progress – keep momentum'}
              {daysSinceLastAccident !== null && daysSinceLastAccident >= 30 && 'Great streak – celebrate & reinforce'}
            </p>
            {lastAccidentDate && (
              <p className="text-[10px] mt-2 text-muted-foreground">Last accident: {lastAccidentDate.toLocaleDateString()}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Monthly Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{thisMonthIncidents.length}</span>
              <div className="flex items-center">
                <incidentTrend.icon className={`h-4 w-4 ${incidentTrend.color}`} />
                <span className="text-sm text-muted-foreground ml-1">vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <span className="text-2xl font-bold">{complianceRate.toFixed(1)}%</span>
              <Progress value={complianceRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Investigations</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{activeInvestigations.length}</span>
            <p className="text-xs text-muted-foreground mt-1">
              {investigations.filter(i => i.status === 'completed').length} completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Risk Exposure</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{highRisks.length}</span>
            <p className="text-xs text-muted-foreground mt-1">high-risk items</p>
          </CardContent>
        </Card>
      </div>

  {/* (Removed Incident Severity Breakdown & Incidents by Type) */}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Near Misses</CardTitle>
          </CardHeader>
          <CardContent>
            {nearMissOccurrences.length === 0 ? (
              <p className="text-muted-foreground text-sm">No near misses reported yet.</p>
            ) : (
              <div className="space-y-3">
                {nearMissOccurrences.map((nm) => (
                  <div key={nm.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{nm.title}</p>
                      <p className="text-xs text-muted-foreground">{nm.reportedDate} • {nm.location}</p>
                    </div>
                    <Badge className={
                      nm.priority === 'critical' ? 'bg-destructive' :
                      nm.priority === 'high' ? 'bg-accent' :
                      nm.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }>
                      {nm.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            {recentIncidentOccurrences.length === 0 ? (
              <p className="text-muted-foreground text-sm">No incidents reported yet.</p>
            ) : (
              <div className="space-y-3">
                {recentIncidentOccurrences.map((occ) => (
                  <div key={occ.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{occ.title}</p>
                      <p className="text-xs text-muted-foreground">{occ.reportedDate} • {occ.location}</p>
                    </div>
                    <Badge className={
                      occ.priority === 'critical' ? 'bg-destructive' :
                      occ.priority === 'high' ? 'bg-accent' :
                      occ.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }>
                      {occ.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Risks</CardTitle>
          </CardHeader>
          <CardContent>
            {recentRiskOccurrences.length === 0 ? (
              <p className="text-muted-foreground text-sm">No risk observations yet.</p>
            ) : (
              <div className="space-y-3">
                {recentRiskOccurrences.map((occ) => (
                  <div key={occ.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{occ.title}</p>
                      <p className="text-xs text-muted-foreground">{occ.reportedDate} • observation</p>
                    </div>
                    <Badge className={
                      occ.priority === 'critical' ? 'bg-destructive' :
                      occ.priority === 'high' ? 'bg-accent' :
                      occ.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }>
                      {occ.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}