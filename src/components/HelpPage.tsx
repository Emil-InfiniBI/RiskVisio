import React, { useState } from 'react';
import { 
  Shield, 
  Database, 
  Key, 
  Users, 
  FileText, 
  BarChart3, 
  AlertTriangle, 
  Settings, 
  Download, 
  Upload, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  Code,
  Globe,
  Lock,
  UserCheck,
  Calendar,
  Search,
  HelpCircle,
  Book,
  Monitor,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

const HelpPage = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: Book },
    { id: 'getting-started', title: 'Getting Started', icon: UserCheck },
    { id: 'changelog', title: 'Changelog', icon: Activity },
    { id: 'data-protection', title: 'Data Protection', icon: Shield },
    { id: 'api-usage', title: 'API Usage', icon: Code },
    { id: 'user-management', title: 'User Management', icon: Users },
    { id: 'features', title: 'Features Guide', icon: Settings },
    { id: 'monitoring', title: 'Monitoring', icon: Monitor },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">RiskVisio Help Center</h1>
          <p className="text-lg text-gray-600">Complete guide to using your Enterprise Risk Management system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Help Topics</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-none border-0 ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {section.title}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Book className="w-5 h-5 mr-2" />
                      Welcome to RiskVisio
                    </CardTitle>
                    <CardDescription>
                      Your comprehensive Enterprise Risk Management solution
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">
                      RiskVisio is a powerful risk management platform designed to help organizations track, 
                      manage, and mitigate risks across multiple facilities and operations.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                        <Shield className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-blue-900">Enterprise Security</h4>
                          <p className="text-sm text-blue-700">Dual credential API authentication with encrypted secrets</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                        <Database className="w-6 h-6 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-green-900">Data Protection</h4>
                          <p className="text-sm text-green-700">Automatic backups every 6 hours with zero data loss</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-purple-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-purple-900">Real-time Analytics</h4>
                          <p className="text-sm text-purple-700">Live dashboards and KPI monitoring</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                        <Globe className="w-6 h-6 text-orange-600 mt-1" />
                        <div>
                          <h4 className="font-semibold text-orange-900">Multi-Factory</h4>
                          <p className="text-sm text-orange-700">Manage risks across BTL, BTG, BTT facilities</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Database Connected</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">API Authentication Active</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Auto-Backup Enabled</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'getting-started' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserCheck className="w-5 h-5 mr-2" />
                      Getting Started Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">1. Login Credentials</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-white rounded border">
                            <h4 className="font-medium text-blue-900">Administrator</h4>
                            <p className="text-sm text-gray-600">Username: <code className="bg-gray-100 px-1 rounded">admin</code></p>
                            <p className="text-sm text-gray-600">Password: <code className="bg-gray-100 px-1 rounded">admin</code></p>
                            <Badge variant="secondary" className="mt-1">Full Access</Badge>
                          </div>
                          
                          <div className="p-3 bg-white rounded border">
                            <h4 className="font-medium text-green-900">BTL Manager</h4>
                            <p className="text-sm text-gray-600">Username: <code className="bg-gray-100 px-1 rounded">manager_btl</code></p>
                            <p className="text-sm text-gray-600">Password: <code className="bg-gray-100 px-1 rounded">demo123</code></p>
                            <Badge variant="outline" className="mt-1">BTL Factory</Badge>
                          </div>
                          
                          <div className="p-3 bg-white rounded border">
                            <h4 className="font-medium text-purple-900">BTG User</h4>
                            <p className="text-sm text-gray-600">Username: <code className="bg-gray-100 px-1 rounded">user_btg</code></p>
                            <p className="text-sm text-gray-600">Password: <code className="bg-gray-100 px-1 rounded">demo123</code></p>
                            <Badge variant="outline" className="mt-1">BTG Factory</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">2. Navigation Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center mb-2">
                            <FileText className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-medium">Occurrences</span>
                          </div>
                          <p className="text-sm text-gray-600">Track safety incidents, near misses, and operational issues</p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                            <span className="font-medium">Risks</span>
                          </div>
                          <p className="text-sm text-gray-600">Identify, assess, and manage operational risks</p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <span className="font-medium">Compliance</span>
                          </div>
                          <p className="text-sm text-gray-600">Monitor regulatory compliance and audit requirements</p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center mb-2">
                            <Search className="w-5 h-5 text-purple-600 mr-2" />
                            <span className="font-medium">Investigations</span>
                          </div>
                          <p className="text-sm text-gray-600">Conduct thorough incident investigations</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'changelog' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Changelog
                    </CardTitle>
                    <CardDescription>
                      Recent updates and improvements to RiskVisio
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-6">
                      {/* Version 0.3.0-beta */}
                      <div className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-blue-900">Version 0.3.0-beta</h3>
                          <Badge variant="default">Current Beta</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Released: September 2025</p>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-green-700 mb-1">🎨 UI/UX Improvements</h4>
                            <ul className="text-sm text-gray-700 space-y-1 ml-4">
                              <li>• Custom RiskVisio logo integration with responsive design</li>
                              <li>• Enhanced occurrence form layout with improved text wrapping</li>
                              <li>• Fixed layout shifting issues during dropdown interactions</li>
                              <li>• Optimized location field display to show only relevant information</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-blue-700 mb-1">🔧 Bug Fixes</h4>
                            <ul className="text-sm text-gray-700 space-y-1 ml-4">
                              <li>• Resolved critical auto-fill issue in occurrence forms</li>
                              <li>• Fixed data integrity problems when viewing existing occurrences</li>
                              <li>• Improved Azure deployment reliability and connection handling</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-purple-700 mb-1">📱 Mobile Experience</h4>
                            <ul className="text-sm text-gray-700 space-y-1 ml-4">
                              <li>• Enhanced mobile responsiveness across all components</li>
                              <li>• Improved touch target sizes for better usability</li>
                              <li>• Optimized form layouts for smaller screens</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Version 0.2.0-beta */}
                      <div className="border-l-4 border-orange-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-orange-900">Version 0.2.0-beta</h3>
                          <Badge variant="secondary">Previous Beta</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Released: August 2025</p>
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-blue-700 mb-1">🔐 Security Enhancements</h4>
                            <ul className="text-sm text-gray-700 space-y-1 ml-4">
                              <li>• Implemented dual credential authentication system</li>
                              <li>• Added SHA-256 hashing for enhanced security</li>
                              <li>• Secure token management with automatic expiration</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-green-700 mb-1">✨ New Features</h4>
                            <ul className="text-sm text-gray-700 space-y-1 ml-4">
                              <li>• Comprehensive help documentation system</li>
                              <li>• Advanced user management capabilities</li>
                              <li>• Enhanced occurrence tracking and reporting</li>
                              <li>• Improved data synchronization</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Upcoming Features */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">🚀 Development Roadmap</h3>
                        <div className="space-y-4">
                          {/* Phase 1 - Current */}
                          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-blue-900">Phase 1: Core Stability</h4>
                              <Badge variant="default" className="bg-blue-600">Current Focus</Badge>
                            </div>
                            <p className="text-sm text-blue-700 mb-2">Target: v0.4-beta</p>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>✅ Dual authentication system</li>
                              <li>✅ Mobile-responsive design</li>
                              <li>✅ Critical bug fixes and data integrity</li>
                              <li>🔄 Performance optimization</li>
                              <li>🔄 Comprehensive testing suite</li>
                              <li>📋 User feedback integration</li>
                            </ul>
                          </div>

                          {/* Phase 2 - Next */}
                          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-green-900">Phase 2: Analytics & Reporting</h4>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">Next</Badge>
                            </div>
                            <p className="text-sm text-green-700 mb-2">Target: v0.5-beta</p>
                            <ul className="text-sm text-green-800 space-y-1">
                              <li>📊 Advanced dashboard with charts and graphs</li>
                              <li>📈 Risk trend analysis and predictions</li>
                              <li>📋 Customizable report generation</li>
                              <li>📤 Export capabilities (PDF, Excel, CSV)</li>
                              <li>🔔 Automated alerts and notifications</li>
                              <li>📅 Scheduled reporting system</li>
                            </ul>
                          </div>

                          {/* Phase 3 - Future */}
                          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-purple-900">Phase 3: Enterprise Features</h4>
                              <Badge variant="outline" className="border-purple-500 text-purple-700">Planned</Badge>
                            </div>
                            <p className="text-sm text-purple-700 mb-2">Target: v0.8-beta</p>
                            <ul className="text-sm text-purple-800 space-y-1">
                              <li>🏢 Multi-tenant architecture</li>
                              <li>🔐 Single Sign-On (SSO) integration</li>
                              <li>👥 Advanced role-based permissions</li>
                              <li>🌐 Multi-language support</li>
                              <li>🔌 Third-party system integrations</li>
                              <li>📱 Native mobile applications</li>
                            </ul>
                          </div>

                          {/* Phase 4 - Production */}
                          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-orange-900">Phase 4: Production Ready</h4>
                              <Badge variant="outline" className="border-orange-500 text-orange-700">v1.0 Goal</Badge>
                            </div>
                            <p className="text-sm text-orange-700 mb-2">Target: v1.0-stable</p>
                            <ul className="text-sm text-orange-800 space-y-1">
                              <li>🛡️ Security audit and compliance certification</li>
                              <li>⚡ High-availability deployment options</li>
                              <li>📚 Comprehensive documentation</li>
                              <li>🎓 Training materials and tutorials</li>
                              <li>🔧 Professional support channels</li>
                              <li>🌟 Enterprise-grade SLA guarantees</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'data-protection' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Data Protection System
                    </CardTitle>
                    <CardDescription>
                      Enterprise-grade data protection with zero data loss guarantee
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Zero Data Loss Guarantee:</strong> Your data is protected by multiple layers of backup and persistent storage systems.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Automatic Backup System</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <RefreshCw className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-medium">Scheduled Backups</span>
                          </div>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Initial backup: 5 seconds after startup</li>
                            <li>• Regular backups: Every 6 hours</li>
                            <li>• Shutdown backup: Before server stops</li>
                            <li>• Retention: Last 10 backups kept</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Database className="w-5 h-5 text-green-600 mr-2" />
                            <span className="font-medium">Storage Locations</span>
                          </div>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• Production: <code>/home/data/data.db</code></li>
                            <li>• Backups: <code>/home/data/backups/</code></li>
                            <li>• Azure persistent storage</li>
                            <li>• Survives deployments & restarts</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Manual Backup Operations</h3>
                      <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Create Manual Backup</h4>
                          <code className="bg-gray-100 p-2 rounded block text-sm">
                            POST /api/database/backup
                          </code>
                          <p className="text-sm text-gray-600 mt-2">Creates an immediate backup of the current database</p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">List Available Backups</h4>
                          <code className="bg-gray-100 p-2 rounded block text-sm">
                            GET /api/database/backups
                          </code>
                          <p className="text-sm text-gray-600 mt-2">Returns list of all backup files with metadata</p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Database Health Check</h4>
                          <code className="bg-gray-100 p-2 rounded block text-sm">
                            GET /api/database/health
                          </code>
                          <p className="text-sm text-gray-600 mt-2">Monitors database connectivity and backup status</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'api-usage' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Code className="w-5 h-5 mr-2" />
                      API Usage & Power BI Integration
                    </CardTitle>
                    <CardDescription>
                      Connect external applications, Power BI, and analytics tools using our REST API
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <Code className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Base URL:</strong> <code>https://your-app.azurewebsites.net/api</code> (Production) or <code>http://localhost:8080/api</code> (Development)
                      </AlertDescription>
                    </Alert>

                    <Tabs defaultValue="quickstart" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
                        <TabsTrigger value="powerbi">Power BI</TabsTrigger>
                        <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                        <TabsTrigger value="authentication">Auth Details</TabsTrigger>
                      </TabsList>

                      <TabsContent value="quickstart" className="space-y-4">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">🚀 Quick Start Guide</h3>
                          
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-3">Step 1: Create API Key (First Time Only)</h4>
                            <div className="space-y-2">
                              <p className="text-sm text-blue-700">When no API keys exist, create your first one:</p>
                              <div className="bg-blue-100 p-3 rounded">
                                <code className="text-xs block">
                                  curl -X POST https://your-app.azurewebsites.net/api/api-keys \<br/>
                                  &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                                  &nbsp;&nbsp;-d '&#123;"name": "Power BI Connection", "accessType": "limited"&#125;'
                                </code>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-3">Step 2: Save Credentials</h4>
                            <div className="space-y-2">
                              <p className="text-sm text-green-700">Response contains your credentials (save immediately!):</p>
                              <div className="bg-green-100 p-3 rounded">
                                <pre className="text-xs">
{`{
  "clientId": "key_abc123defg456",
  "clientSecret": "secret_xyz789uvw123pqr456",
  "name": "Power BI Connection",
  "accessType": "limited"
}`}
                                </pre>
                              </div>
                              <Badge variant="destructive" className="mt-2">⚠️ Secret shown only once!</Badge>
                            </div>
                          </div>

                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <h4 className="font-medium text-purple-900 mb-3">Step 3: Test Connection</h4>
                            <div className="space-y-2">
                              <p className="text-sm text-purple-700">Verify your credentials work:</p>
                              <div className="bg-purple-100 p-3 rounded">
                                <code className="text-xs block">
                                  curl -X GET https://your-app.azurewebsites.net/api/occurrences \<br/>
                                  &nbsp;&nbsp;-H "x-client-id: key_abc123defg456" \<br/>
                                  &nbsp;&nbsp;-H "x-client-secret: secret_xyz789uvw123pqr456"
                                </code>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="powerbi" className="space-y-4">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">📊 Power BI Integration</h3>
                          
                          <Alert>
                            <Database className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Power BI Recommendation:</strong> Use "limited" access type API keys for reporting to ensure read-only access.
                            </AlertDescription>
                          </Alert>

                          <div className="space-y-4">
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-3">Method 1: Web Data Source (Recommended)</h4>
                              <div className="space-y-3">
                                <p className="text-sm text-gray-600">Use Power BI's Web connector with custom headers:</p>
                                
                                <div className="bg-gray-50 p-3 rounded">
                                  <h5 className="font-medium text-sm mb-2">1. Data Source URL:</h5>
                                  <code className="text-xs block mb-3">https://your-app.azurewebsites.net/api/occurrences</code>
                                  
                                  <h5 className="font-medium text-sm mb-2">2. HTTP Headers:</h5>
                                  <pre className="text-xs">
{`x-client-id: key_abc123defg456
x-client-secret: secret_xyz789uvw123pqr456`}
                                  </pre>
                                </div>

                                <div className="bg-blue-50 p-3 rounded">
                                  <h5 className="font-medium text-sm mb-2">Power Query M Code Example:</h5>
                                  <pre className="text-xs">
{`let
    Headers = [
        #"x-client-id" = "key_abc123defg456",
        #"x-client-secret" = "secret_xyz789uvw123pqr456"
    ],
    Source = Json.Document(
        Web.Contents(
            "https://your-app.azurewebsites.net/api/occurrences",
            [Headers=Headers]
        )
    ),
    Table = Table.FromList(Source, Splitter.SplitByNothing(), null, null, ExtraValues.Error),
    ExpandedTable = Table.ExpandRecordColumn(Table, "Column1", 
        {"id", "title", "type", "priority", "status", "factory", "reportedDate"}
    )
in
    ExpandedTable`}
                                  </pre>
                                </div>
                              </div>
                            </div>

                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-3">Method 2: REST API Connector</h4>
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">For more complex scenarios, use Power BI's REST API connector:</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  <li>• Base URL: <code>https://your-app.azurewebsites.net/api</code></li>
                                  <li>• Authentication: Custom Headers</li>
                                  <li>• Headers: Add both x-client-id and x-client-secret</li>
                                  <li>• Enable automatic refresh</li>
                                </ul>
                              </div>
                            </div>

                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                              <h4 className="font-medium text-green-900 mb-3">Available Data Endpoints for Power BI</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <p className="font-medium text-sm">📝 Occurrences</p>
                                  <code className="text-xs">/api/occurrences</code>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">⚠️ Risks</p>
                                  <code className="text-xs">/api/risks</code>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">📋 Compliance</p>
                                  <code className="text-xs">/api/compliance</code>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">🔍 Investigations</p>
                                  <code className="text-xs">/api/investigations</code>
                                </div>
                              </div>
                              <p className="text-sm text-green-700 mt-3">
                                💡 <strong>Pro Tip:</strong> Add <code>?factory=BTL</code> to filter by specific factory
                              </p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="endpoints" className="space-y-4">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">🔌 Data Endpoints</h3>
                          
                          <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-2 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                Occurrences
                              </h4>
                              <div className="space-y-2">
                                <code className="bg-gray-100 p-2 rounded block text-sm">GET /api/occurrences</code>
                                <code className="bg-gray-100 p-2 rounded block text-sm">GET /api/occurrences?factory=BTL</code>
                                <p className="text-sm text-gray-600">Safety incidents, near misses, equipment failures</p>
                              </div>
                            </div>

                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-2 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                                Risks
                              </h4>
                              <div className="space-y-2">
                                <code className="bg-gray-100 p-2 rounded block text-sm">GET /api/risks</code>
                                <code className="bg-gray-100 p-2 rounded block text-sm">GET /api/risks?factory=BTG</code>
                                <p className="text-sm text-gray-600">Risk assessments with likelihood and impact scoring</p>
                              </div>
                            </div>

                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-2 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                Compliance
                              </h4>
                              <div className="space-y-2">
                                <code className="bg-gray-100 p-2 rounded block text-sm">GET /api/compliance</code>
                                <code className="bg-gray-100 p-2 rounded block text-sm">GET /api/compliance?factory=BTT</code>
                                <p className="text-sm text-gray-600">Regulatory compliance tracking and audit trails</p>
                              </div>
                            </div>

                            <div className="p-4 border rounded-lg">
                              <h4 className="font-medium mb-2 flex items-center">
                                <Search className="w-4 h-4 mr-2 text-purple-600" />
                                Investigations
                              </h4>
                              <div className="space-y-2">
                                <code className="bg-gray-100 p-2 rounded block text-sm">GET /api/investigations</code>
                                <code className="bg-gray-100 p-2 rounded block text-sm">GET /api/investigations?factory=ALL</code>
                                <p className="text-sm text-gray-600">Incident investigations and root cause analysis</p>
                              </div>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h4 className="font-medium text-blue-900 mb-2">💾 Database Export</h4>
                              <div className="space-y-2">
                                <code className="bg-blue-100 p-2 rounded block text-sm">GET /api/database</code>
                                <p className="text-sm text-blue-700">Complete database export with all tables and metadata</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="authentication" className="space-y-4">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">🔐 Authentication Details</h3>
                          
                          <div className="space-y-3">
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <h4 className="font-medium text-yellow-900 mb-2">Bootstrap Mode</h4>
                              <p className="text-sm text-yellow-700 mb-2">When no API keys exist:</p>
                              <Badge variant="outline" className="bg-yellow-100">No Authentication Required</Badge>
                              <p className="text-xs text-yellow-600 mt-2">Use this mode only to create your first API key</p>
                            </div>
                            
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h4 className="font-medium text-blue-900 mb-2">Dual Credential Mode (Production)</h4>
                              <p className="text-sm text-blue-700 mb-2">All requests require both headers:</p>
                              <div className="bg-blue-100 p-3 rounded">
                                <code className="text-sm block">
                                  x-client-id: key_xxxxxxxxxxxx<br/>
                                  x-client-secret: secret_xxxxxxxxxxxxxxxx
                                </code>
                              </div>
                              <p className="text-xs text-blue-600 mt-2">Client secrets are SHA-256 hashed for security</p>
                            </div>
                            
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Legacy Mode (Fallback)</h4>
                              <p className="text-sm text-gray-700 mb-2">Environment variable RISKVISIO_API_KEY:</p>
                              <code className="bg-gray-100 p-2 rounded block text-sm">x-api-key: your-legacy-api-key</code>
                              <p className="text-xs text-gray-600 mt-2">Provided for backward compatibility only</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Access Levels</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">Full Access</h4>
                                <ul className="text-sm text-green-700 space-y-1">
                                  <li>• Read all data</li>
                                  <li>• Create/update records</li>
                                  <li>• User management</li>
                                  <li>• API key management</li>
                                </ul>
                                <Badge variant="default" className="mt-2">Admin Use</Badge>
                              </div>
                              
                              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Limited Access</h4>
                                <ul className="text-sm text-blue-700 space-y-1">
                                  <li>• Read all data</li>
                                  <li>• Export capabilities</li>
                                  <li>• View reports</li>
                                  <li>• No write operations</li>
                                </ul>
                                <Badge variant="secondary" className="mt-2">Perfect for Power BI</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'user-management' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      User Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">User Roles & Permissions</h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-medium text-red-900 mb-2">Administrator</h4>
                          <ul className="text-sm text-red-700 space-y-1">
                            <li>• Full system access</li>
                            <li>• User management</li>
                            <li>• API key management</li>
                            <li>• System configuration</li>
                            <li>• Cross-factory access</li>
                          </ul>
                          <Badge variant="destructive" className="mt-2">Full Access</Badge>
                        </div>
                        
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">User</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Factory-specific access</li>
                            <li>• Create/edit records</li>
                            <li>• View reports</li>
                            <li>• Export data</li>
                            <li>• Limited to assigned factories</li>
                          </ul>
                          <Badge variant="secondary" className="mt-2">Factory Limited</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Factory Access Control</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg text-center">
                          <h4 className="font-medium text-blue-900 mb-2">BTL Factory</h4>
                          <p className="text-sm text-gray-600">Bertam Leather</p>
                          <Badge variant="outline" className="mt-2">Manufacturing</Badge>
                        </div>
                        
                        <div className="p-4 border rounded-lg text-center">
                          <h4 className="font-medium text-green-900 mb-2">BTG Factory</h4>
                          <p className="text-sm text-gray-600">Bertam Glove</p>
                          <Badge variant="outline" className="mt-2">Production</Badge>
                        </div>
                        
                        <div className="p-4 border rounded-lg text-center">
                          <h4 className="font-medium text-purple-900 mb-2">BTT Factory</h4>
                          <p className="text-sm text-gray-600">Bertam Textile</p>
                          <Badge variant="outline" className="mt-2">Textile</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">User Management API</h3>
                      <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">List Users</h4>
                          <code className="bg-gray-100 p-2 rounded block text-sm">
                            GET /api/users
                          </code>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Create/Update User</h4>
                          <code className="bg-gray-100 p-2 rounded block text-sm mb-2">
                            POST /api/users
                          </code>
                          <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
{`{
  "username": "new_user",
  "password": "secure_password",
  "role": "user",
  "fullName": "John Doe",
  "email": "john@company.com",
  "factories": ["BTL", "BTG"],
  "isActive": true
}`}
                          </pre>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Delete User</h4>
                          <code className="bg-gray-100 p-2 rounded block text-sm">
                            DELETE /api/users/&#123;userId&#125;
                          </code>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'features' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Features Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs defaultValue="occurrences" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="occurrences">Occurrences</TabsTrigger>
                        <TabsTrigger value="risks">Risks</TabsTrigger>
                        <TabsTrigger value="compliance">Compliance</TabsTrigger>
                        <TabsTrigger value="investigations">Investigations</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="occurrences" className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">What are Occurrences?</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Track safety incidents, near misses, equipment failures, and operational issues across your facilities.
                          </p>
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Key Fields:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• <strong>Type:</strong> Incident, Near Miss, Equipment Failure, etc.</li>
                              <li>• <strong>Priority:</strong> Low, Medium, High, Critical</li>
                              <li>• <strong>Status:</strong> Open, In Progress, Resolved, Closed</li>
                              <li>• <strong>Factory:</strong> BTL, BTG, BTT assignment</li>
                              <li>• <strong>Location:</strong> Specific area within facility</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">API Endpoints</h4>
                          <div className="space-y-2">
                            <code className="bg-gray-100 p-2 rounded block text-sm">GET /api/occurrences?factory=BTL</code>
                            <code className="bg-gray-100 p-2 rounded block text-sm">POST /api/occurrences</code>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="risks" className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Risk Management</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Identify, assess, and manage operational risks with likelihood and impact scoring.
                          </p>
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Risk Assessment:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• <strong>Likelihood:</strong> Very Low, Low, Medium, High, Very High</li>
                              <li>• <strong>Impact:</strong> Negligible, Minor, Moderate, Major, Severe</li>
                              <li>• <strong>Risk Level:</strong> Auto-calculated based on matrix</li>
                              <li>• <strong>Category:</strong> Operational, Financial, Strategic, etc.</li>
                            </ul>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="compliance" className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Compliance Tracking</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Monitor regulatory compliance, audit requirements, and certification status.
                          </p>
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Compliance Features:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• <strong>Regulation:</strong> ISO 14001, OSHA, EPA, etc.</li>
                              <li>• <strong>Status:</strong> Compliant, Non-Compliant, Pending</li>
                              <li>• <strong>Due Dates:</strong> Renewal and audit schedules</li>
                              <li>• <strong>Assignment:</strong> Responsible person tracking</li>
                            </ul>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="investigations" className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Incident Investigations</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Conduct thorough incident investigations with findings and recommendations.
                          </p>
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Investigation Process:</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• <strong>Incident Link:</strong> Connect to original occurrence</li>
                              <li>• <strong>Investigator:</strong> Assigned personnel</li>
                              <li>• <strong>Findings:</strong> Root cause analysis</li>
                              <li>• <strong>Recommendations:</strong> Corrective actions</li>
                            </ul>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'monitoring' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Monitor className="w-5 h-5 mr-2" />
                      System Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Health Check Endpoints</h3>
                      <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Application Health</h4>
                          <code className="bg-gray-100 p-2 rounded block text-sm mb-2">
                            GET /health
                          </code>
                          <p className="text-sm text-gray-600">Basic application status and timestamp</p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Database Health</h4>
                          <code className="bg-gray-100 p-2 rounded block text-sm mb-2">
                            GET /api/database/health
                          </code>
                          <p className="text-sm text-gray-600">Database connectivity, backup status, and file information</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Log Messages to Monitor</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Success Indicators</h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>✅ Connected to SQLite database</li>
                            <li>✅ Database backup created</li>
                            <li>✅ Created default user</li>
                            <li>✅ Database connection closed</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-medium text-red-900 mb-2">Error Indicators</h4>
                          <ul className="text-sm text-red-700 space-y-1">
                            <li>❌ Database connection failed</li>
                            <li>❌ Backup failed</li>
                            <li>❌ Database close error</li>
                            <li>❌ Error creating default user</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Key Metrics to Track</h3>
                      <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Database Metrics</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Database file size growth</li>
                            <li>• Backup creation frequency</li>
                            <li>• Connection pool status</li>
                            <li>• Query response times</li>
                          </ul>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">API Metrics</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Request rates per endpoint</li>
                            <li>• Authentication success/failure rates</li>
                            <li>• API key usage patterns</li>
                            <li>• Response time distribution</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'troubleshooting' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <HelpCircle className="w-5 h-5 mr-2" />
                      Troubleshooting Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Common Issues</h3>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-medium text-red-900 mb-2">❌ Login Failed</h4>
                          <div className="space-y-2">
                            <p className="text-sm text-red-700"><strong>Symptoms:</strong> "Invalid credentials" or login form doesn't respond</p>
                            <p className="text-sm text-red-700"><strong>Solution:</strong></p>
                            <ul className="text-sm text-red-700 space-y-1 ml-4">
                              <li>1. Verify username/password combinations listed in Getting Started</li>
                              <li>2. Check if default users were created (look for "✓ Created default user" in logs)</li>
                              <li>3. Ensure database is connected</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-medium text-yellow-900 mb-2">⚠️ API Authentication Error</h4>
                          <div className="space-y-2">
                            <p className="text-sm text-yellow-700"><strong>Symptoms:</strong> "Client ID and Client Secret required"</p>
                            <p className="text-sm text-yellow-700"><strong>Solution:</strong></p>
                            <ul className="text-sm text-yellow-700 space-y-1 ml-4">
                              <li>1. Create API key via <code>POST /api/api-keys</code></li>
                              <li>2. Include both headers: <code>x-client-id</code> and <code>x-client-secret</code></li>
                              <li>3. Verify key is enabled and not revoked</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">🔄 Backup Issues</h4>
                          <div className="space-y-2">
                            <p className="text-sm text-blue-700"><strong>Symptoms:</strong> "❌ Backup failed" in logs</p>
                            <p className="text-sm text-blue-700"><strong>Solution:</strong></p>
                            <ul className="text-sm text-blue-700 space-y-1 ml-4">
                              <li>1. Check disk space: <code>df -h /home/data</code></li>
                              <li>2. Verify write permissions on backup directory</li>
                              <li>3. Ensure database file exists and is accessible</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Diagnostic Commands</h3>
                      <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Check Database Status</h4>
                          <code className="bg-gray-100 p-2 rounded block text-sm">
                            curl http://localhost:8080/api/database/health
                          </code>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">List Available Backups</h4>
                          <code className="bg-gray-100 p-2 rounded block text-sm">
                            curl http://localhost:8080/api/database/backups
                          </code>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Check API Keys</h4>
                          <code className="bg-gray-100 p-2 rounded block text-sm">
                            curl http://localhost:8080/api/api-keys
                          </code>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Emergency Recovery</h3>
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="font-medium mb-2">Database Recovery Process</h4>
                        <ol className="text-sm text-gray-700 space-y-2">
                          <li>1. <strong>Stop the application</strong></li>
                          <li>2. <strong>List backups:</strong> <code>GET /api/database/backups</code></li>
                          <li>3. <strong>Copy backup file</strong> to main database location</li>
                          <li>4. <strong>Restart application</strong></li>
                          <li>5. <strong>Verify data integrity</strong> via health check</li>
                        </ol>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Contact Support</h3>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          If issues persist, collect the following information:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Application logs (startup and error messages)</li>
                          <li>• Database health status response</li>
                          <li>• List of available backups</li>
                          <li>• Steps to reproduce the issue</li>
                          <li>• Environment details (local vs Azure)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
