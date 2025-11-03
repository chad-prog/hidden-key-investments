/**
 * Workflow Builder - Visual Automation Interface
 * 
 * Features:
 * - Visual drag-and-drop canvas (foundation)
 * - Workflow nodes (trigger, action, condition)
 * - Node configuration
 * - Workflow testing
 * - Template library
 * - Execution monitoring
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Plus,
  Save,
  Settings,
  Zap,
  GitBranch,
  Mail,
  MessageSquare,
  Clock,
  Filter,
  CheckCircle,
  AlertCircle,
  Trash2,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type NodeType = 'trigger' | 'action' | 'condition';

interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'paused';
  nodes: WorkflowNode[];
  connections: Array<{ from: string; to: string }>;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
}

const NODE_TYPES = {
  trigger: {
    icon: <Zap className="h-4 w-4" />,
    color: 'text-blue-600 bg-blue-100',
    label: 'Trigger'
  },
  action: {
    icon: <Settings className="h-4 w-4" />,
    color: 'text-green-600 bg-green-100',
    label: 'Action'
  },
  condition: {
    icon: <GitBranch className="h-4 w-4" />,
    color: 'text-purple-600 bg-purple-100',
    label: 'Condition'
  }
};

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'welcome-series',
    name: 'Welcome Email Series',
    description: 'Automated welcome email sequence for new leads',
    category: 'Email',
    nodes: [
      { id: '1', type: 'trigger', name: 'New Lead Created', config: {}, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', name: 'Send Welcome Email', config: { service: 'sendgrid', templateId: 'tpl-1' }, position: { x: 0, y: 1 } },
      { id: '3', type: 'action', name: 'Wait 2 Days', config: { delay: '2d' }, position: { x: 0, y: 2 } },
      { id: '4', type: 'action', name: 'Send Follow-up', config: { service: 'sendgrid' }, position: { x: 0, y: 3 } }
    ]
  },
  {
    id: 'lead-scoring',
    name: 'Lead Scoring Automation',
    description: 'Automatically score and route qualified leads',
    category: 'Lead Management',
    nodes: [
      { id: '1', type: 'trigger', name: 'Lead Updated', config: {}, position: { x: 0, y: 0 } },
      { id: '2', type: 'condition', name: 'Check Score', config: {}, position: { x: 0, y: 1 } },
      { id: '3', type: 'action', name: 'Assign to Sales', config: {}, position: { x: -1, y: 2 } },
      { id: '4', type: 'action', name: 'Add to Nurture', config: {}, position: { x: 1, y: 2 } }
    ]
  },
  {
    id: 'sms-reminder',
    name: 'SMS Appointment Reminder',
    description: 'Send SMS reminders for scheduled appointments',
    category: 'Communication',
    nodes: [
      { id: '1', type: 'trigger', name: 'Appointment Scheduled', config: {}, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', name: 'Wait Until 24h Before', config: { delay: '24h' }, position: { x: 0, y: 1 } },
      { id: '3', type: 'action', name: 'Send SMS Reminder', config: { service: 'twilio', templateId: 'tpl-2' }, position: { x: 0, y: 2 } }
    ]
  },
  {
    id: 'investment-opportunity',
    name: 'Investment Opportunity Notification',
    description: 'Notify investors about new opportunities via email and SMS',
    category: 'Communication',
    nodes: [
      { id: '1', type: 'trigger', name: 'New Property Listed', config: {}, position: { x: 0, y: 0 } },
      { id: '2', type: 'action', name: 'Send Email Alert', config: { service: 'sendgrid', templateId: 'tpl-3' }, position: { x: -1, y: 1 } },
      { id: '3', type: 'action', name: 'Send SMS Alert', config: { service: 'twilio' }, position: { x: 1, y: 1 } }
    ]
  }
];

export default function WorkflowBuilder() {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Welcome Email Series',
      description: 'Automated welcome email sequence',
      status: 'active',
      nodes: [],
      connections: []
    },
    {
      id: '2',
      name: 'Lead Scoring',
      description: 'Automatic lead qualification',
      status: 'active',
      nodes: [],
      connections: []
    },
    {
      id: '3',
      name: 'Follow-up Sequence',
      description: 'Multi-touch follow-up campaign',
      status: 'draft',
      nodes: [],
      connections: []
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFromTemplate = (template: WorkflowTemplate) => {
    const newWorkflow: Workflow = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      status: 'draft',
      nodes: template.nodes,
      connections: []
    };

    setWorkflows([...workflows, newWorkflow]);
    setSelectedWorkflow(newWorkflow);
    setIsCreating(false);

    toast({
      title: 'Workflow Created',
      description: `Created "${template.name}" from template.`
    });
  };

  const handleActivateWorkflow = (workflowId: string) => {
    setWorkflows(workflows.map(w => 
      w.id === workflowId ? { ...w, status: 'active' as const } : w
    ));

    toast({
      title: 'Workflow Activated',
      description: 'The workflow is now running.'
    });
  };

  const handlePauseWorkflow = (workflowId: string) => {
    setWorkflows(workflows.map(w => 
      w.id === workflowId ? { ...w, status: 'paused' as const } : w
    ));

    toast({
      title: 'Workflow Paused',
      description: 'The workflow has been paused.'
    });
  };

  const getStatusBadge = (status: Workflow['status']) => {
    const variants = {
      active: { variant: 'default' as const, label: 'Active' },
      draft: { variant: 'secondary' as const, label: 'Draft' },
      paused: { variant: 'outline' as const, label: 'Paused' }
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Builder</h1>
          <p className="text-muted-foreground">Create and manage automated workflows</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </div>

      {isCreating ? (
        /* Template Selection */
        <Card>
          <CardHeader>
            <CardTitle>Create New Workflow</CardTitle>
            <CardDescription>Choose a template to get started quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {WORKFLOW_TEMPLATES.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline" className="mt-2">{template.category}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Settings className="h-4 w-4" />
                      <span>{template.nodes.length} nodes</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleCreateFromTemplate(template)}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <Card className="cursor-pointer hover:border-primary transition-colors border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">Start from Scratch</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a custom workflow from an empty canvas
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => setIsCreating(false)}>
                    Create Blank
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="ghost" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Workflow Management */
        <Tabs defaultValue="workflows" className="space-y-4">
          <TabsList>
            <TabsTrigger value="workflows">My Workflows</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4">
            <div className="grid gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{workflow.name}</CardTitle>
                        <CardDescription>{workflow.description}</CardDescription>
                      </div>
                      {getStatusBadge(workflow.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Settings className="h-4 w-4" />
                          <span>{workflow.nodes.length} nodes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-4 w-4" />
                          <span>{workflow.connections.length} connections</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedWorkflow(workflow)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Edit
                        </Button>

                        {workflow.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePauseWorkflow(workflow.id)}
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Pause
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleActivateWorkflow(workflow.id)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Activate
                          </Button>
                        )}

                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>

                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Executions</CardTitle>
                <CardDescription>Workflow execution history and logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { workflow: 'Welcome Email Series', status: 'success', time: '2 minutes ago', duration: '1.2s' },
                    { workflow: 'Lead Scoring', status: 'success', time: '5 minutes ago', duration: '0.8s' },
                    { workflow: 'Follow-up Sequence', status: 'running', time: '10 minutes ago', duration: '—' },
                    { workflow: 'Welcome Email Series', status: 'success', time: '15 minutes ago', duration: '1.1s' },
                    { workflow: 'Lead Scoring', status: 'failed', time: '30 minutes ago', duration: '2.3s' }
                  ].map((execution, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        {execution.status === 'success' && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {execution.status === 'failed' && (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                        {execution.status === 'running' && (
                          <Clock className="h-5 w-5 text-blue-600 animate-spin" />
                        )}
                        <div>
                          <p className="font-medium">{execution.workflow}</p>
                          <p className="text-sm text-muted-foreground">{execution.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {execution.duration}
                        </span>
                        <Button variant="ghost" size="sm">
                          View Logs
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <p className="text-xs text-muted-foreground">18 failures</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Avg. Execution Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.3s</div>
                  <p className="text-xs text-muted-foreground">-0.2s improvement</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Performance</CardTitle>
                <CardDescription>Execution stats by workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{workflow.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(Math.random() * 500)} executions
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary rounded-full h-2">
                          <div
                            className="bg-green-600 rounded-full h-2"
                            style={{ width: `${95 + Math.random() * 5}%` }}
                          />
                        </div>
                        <span className="text-sm text-green-600">
                          {(95 + Math.random() * 5).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Canvas Placeholder */}
      {selectedWorkflow && !isCreating && (
        <Card className="border-2 border-dashed">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Workflow Canvas</CardTitle>
                <CardDescription>Visual workflow editor (Phase 2 - Coming Soon)</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedWorkflow(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <div className="text-center space-y-2">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Visual drag-and-drop canvas will be available in Phase 2
                </p>
                <p className="text-xs text-muted-foreground">
                  Current workflow: {selectedWorkflow.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
