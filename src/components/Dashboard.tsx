import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Incident, Risk, ComplianceItem, Investigation, Occurrence } from '@/types';
import { 
  AlertTriangle, 
  Shield, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Clock,
  BarChart3,
  CheckCircle2,
  Search,
  Activity,
  Eye,
  AlertCircle
} from 'lucide-react';

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
    <div className="space-y-8">
      {/* Alert Banner - Only show if there are critical items */}
      {(criticalIncidents.length > 0 || overdueCompliance.length > 0 || highRisks.length > 0) && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-3">
                Immediate Attention Required
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {criticalIncidents.length > 0 && (
                  <div className="bg-white/80 rounded-lg p-3 border border-red-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-800">
                        {criticalIncidents.length} Critical Incident{criticalIncidents.length !== 1 ? 's' : ''}
                      </span>
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    </div>
                  </div>
                )}
                {overdueCompliance.length > 0 && (
                  <div className="bg-white/80 rounded-lg p-3 border border-red-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-800">
                        {overdueCompliance.length} Overdue Compliance
                      </span>
                      <Badge variant="destructive" className="text-xs">Overdue</Badge>
                    </div>
                  </div>
                )}
                {highRisks.length > 0 && (
                  <div className="bg-white/80 rounded-lg p-3 border border-orange-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-orange-800">
                        {highRisks.length} High-Risk Item{highRisks.length !== 1 ? 's' : ''}
                      </span>
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Monitor</Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Performance Indicators */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Safety Performance Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Days Since Last Accident - Featured Card */}
          <Card className="relative overflow-hidden border-2 transition-all duration-200 hover:shadow-lg border-gray-200 bg-gray-50">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
              <Clock className="w-full h-full" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-gray-100">
                  <Clock className="h-3 w-3 text-gray-600" />
                </div>
                Days Since Last Accident
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-gray-900">
                    {daysSinceLastAccident !== null ? daysSinceLastAccident : '—'}
                  </span>
                  {daysSinceLastAccident !== null && (
                    <span className="text-xs font-medium text-gray-500 uppercase">days</span>
                  )}
                </div>
                <div className="text-xs font-medium">
                  {daysSinceLastAccident === null && (
                    <span className="text-gray-500">No accidents recorded</span>
                  )}
                  {daysSinceLastAccident !== null && (
                    <span className="text-gray-600">Last accident: {lastAccidentDate?.toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Rate */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-green-100">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                Compliance Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <span className="text-3xl font-bold text-gray-900">{complianceRate.toFixed(1)}%</span>
                <div className="space-y-1">
                  <Progress value={complianceRate} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {compliance.filter(c => c.status === 'compliant').length} of {compliance.length} items compliant
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Investigations */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-purple-100">
                  <Search className="h-3 w-3 text-purple-600" />
                </div>
                Active Investigations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="text-3xl font-bold text-gray-900">{activeInvestigations.length}</span>
              <p className="text-xs text-gray-500 mt-1">
                {investigations.filter(i => i.status === 'completed').length} completed this month
              </p>
            </CardContent>
          </Card>

          {/* Risk Exposure */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-orange-100">
                  <Shield className="h-3 w-3 text-orange-600" />
                </div>
                Risk Exposure
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <span className="text-3xl font-bold text-gray-900">{highRisks.length}</span>
              <p className="text-xs text-gray-500 mt-1">high-risk items requiring attention</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Recent Activity
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Near Misses */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="h-4 w-4 text-yellow-600" />
                Near Misses
                <Badge variant="outline" className="ml-auto text-xs">
                  {nearMissOccurrences.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {nearMissOccurrences.length === 0 ? (
                <div className="text-center py-8">
                  <Eye className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No near misses reported</p>
                  <p className="text-xs text-gray-400">Great safety awareness!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nearMissOccurrences.map((nm) => (
                    <div key={nm.id} className="group p-3 border border-gray-100 rounded-lg hover:border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700">
                            {nm.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{nm.reportedDate}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 truncate">{nm.location}</span>
                          </div>
                        </div>
                        <Badge 
                          variant={nm.priority === 'critical' ? 'destructive' : 'secondary'}
                          className="ml-2 flex-shrink-0 text-xs"
                        >
                          {nm.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Incidents */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                Incidents
                <Badge variant="outline" className="ml-auto text-xs">
                  {recentIncidentOccurrences.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {recentIncidentOccurrences.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No incidents reported</p>
                  <p className="text-xs text-gray-400">Excellent safety record!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentIncidentOccurrences.map((inc) => (
                    <div key={inc.id} className="group p-3 border border-gray-100 rounded-lg hover:border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700">
                            {inc.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{inc.reportedDate}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 truncate">{inc.location}</span>
                          </div>
                        </div>
                        <Badge 
                          variant={inc.priority === 'critical' ? 'destructive' : 'secondary'}
                          className="ml-2 flex-shrink-0 text-xs"
                        >
                          {inc.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Risk Observations */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-600" />
                Risk Observations
                <Badge variant="outline" className="ml-auto text-xs">
                  {recentRiskOccurrences.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {recentRiskOccurrences.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No risk observations</p>
                  <p className="text-xs text-gray-400">Consider proactive reporting</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRiskOccurrences.map((risk) => (
                    <div key={risk.id} className="group p-3 border border-gray-100 rounded-lg hover:border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-gray-700">
                            {risk.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{risk.reportedDate}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">observation</span>
                          </div>
                        </div>
                        <Badge 
                          variant={risk.priority === 'critical' ? 'destructive' : 'secondary'}
                          className="ml-2 flex-shrink-0 text-xs"
                        >
                          {risk.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}