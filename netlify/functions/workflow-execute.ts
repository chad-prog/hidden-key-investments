/**
 * Workflow Execution Engine - Netlify Serverless Function
 * Executes workflow actions (email, SMS, delays, conditions)
 */

import type { Handler } from '@netlify/functions';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface WorkflowExecution {
  workflowId: string;
  nodes: WorkflowNode[];
  connections: Array<{ from: string; to: string }>;
  data: Record<string, any>; // Context data for template variables
}

interface ExecutionResult {
  success: boolean;
  executionId: string;
  results: Array<{
    nodeId: string;
    nodeName: string;
    status: 'success' | 'failed' | 'skipped';
    message?: string;
    error?: string;
  }>;
}

/**
 * Execute a single workflow node
 */
async function executeNode(node: WorkflowNode, data: Record<string, any>): Promise<{
  status: 'success' | 'failed' | 'skipped';
  message?: string;
  error?: string;
}> {
  try {
    switch (node.type) {
      case 'trigger':
        // Triggers don't execute, they just start the workflow
        return { status: 'success', message: 'Workflow triggered' };

      case 'action':
        // Execute action based on service type
        if (node.config.service === 'sendgrid') {
          // Send email via SendGrid
          const emailResponse = await fetch(`${process.env.URL || 'http://localhost:8888'}/.netlify/functions/sendgrid`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: data.email || data.to,
              subject: data.subject || 'Notification',
              content: data.content || '<p>Automated notification</p>',
              variables: data
            })
          });

          const emailResult = await emailResponse.json();
          
          if (emailResult.success) {
            return { status: 'success', message: `Email sent: ${emailResult.message}` };
          } else {
            return { status: 'failed', error: emailResult.error || 'Failed to send email' };
          }
        } else if (node.config.service === 'twilio') {
          // Send SMS via Twilio
          const smsResponse = await fetch(`${process.env.URL || 'http://localhost:8888'}/.netlify/functions/twilio-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: data.phone || data.to,
              message: data.message || 'Automated notification',
              variables: data
            })
          });

          const smsResult = await smsResponse.json();
          
          if (smsResult.success) {
            return { status: 'success', message: `SMS sent: ${smsResult.message}` };
          } else {
            return { status: 'failed', error: smsResult.error || 'Failed to send SMS' };
          }
        } else if (node.config.delay) {
          // Delay action (in real implementation, this would schedule for later)
          return { status: 'success', message: `Delay scheduled: ${node.config.delay}` };
        } else {
          // Generic action
          return { status: 'success', message: `Action completed: ${node.name}` };
        }

      case 'condition': {
        // Evaluate condition (simplified - in production, use expression engine)
        const conditionMet = evaluateCondition(node.config, data);
        return { 
          status: conditionMet ? 'success' : 'skipped', 
          message: conditionMet ? 'Condition met' : 'Condition not met'
        };
      }

      default:
        return { status: 'skipped', message: 'Unknown node type' };
    }
  } catch (error: any) {
    console.error('Error executing node:', error);
    return { status: 'failed', error: error.message || 'Unknown error' };
  }
}

/**
 * Evaluate a condition
 */
function evaluateCondition(config: Record<string, any>, data: Record<string, any>): boolean {
  // Simple condition evaluation (in production, use a proper expression engine)
  if (config.field && config.operator && config.value !== undefined) {
    const fieldValue = data[config.field];
    
    switch (config.operator) {
      case 'equals':
        return fieldValue === config.value;
      case 'not_equals':
        return fieldValue !== config.value;
      case 'greater_than':
        return Number(fieldValue) > Number(config.value);
      case 'less_than':
        return Number(fieldValue) < Number(config.value);
      case 'contains':
        return String(fieldValue).includes(String(config.value));
      default:
        return false;
    }
  }
  
  // Default to true if no condition specified
  return true;
}

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const execution: WorkflowExecution = JSON.parse(event.body || '{}');
    const { workflowId, nodes, data } = execution;

    // Validate required fields
    if (!workflowId || !nodes || !Array.isArray(nodes)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Missing required fields: workflowId, nodes' 
        })
      };
    }

    const executionId = `exec-${Date.now()}`;
    const results: ExecutionResult['results'] = [];

    // Execute nodes in sequence (in production, consider parallel execution)
    for (const node of nodes) {
      const result = await executeNode(node, data || {});
      results.push({
        nodeId: node.id,
        nodeName: node.name,
        ...result
      });

      // Stop execution if a node fails (unless it's a condition that's skipped)
      if (result.status === 'failed') {
        break;
      }
    }

    const success = results.every(r => r.status !== 'failed');

    return {
      statusCode: 200,
      body: JSON.stringify({
        success,
        executionId,
        workflowId,
        message: success ? 'Workflow executed successfully' : 'Workflow execution failed',
        results
      })
    };
  } catch (error: any) {
    console.error('Workflow execution error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to execute workflow',
        message: error.message || 'Unknown error'
      })
    };
  }
};
