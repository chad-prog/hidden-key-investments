/**
 * Workflow Engine Foundation
 * 
 * Rule-based automation engine for triggering actions based on CRM events
 * Supports email/SMS notifications, status changes, task creation, etc.
 */

import { z } from 'zod';
import type { Lead, Opportunity, Investor } from './schemas/crm';

// ============================================================================
// Workflow Schema Definitions
// ============================================================================

export const TriggerTypeSchema = z.enum([
  'lead_created',
  'lead_status_changed',
  'lead_score_changed',
  'opportunity_created',
  'opportunity_stage_changed',
  'investor_created',
  'investor_status_changed',
  'activity_completed',
  'time_based',
  'manual',
]);

export const ConditionOperatorSchema = z.enum([
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'greater_than',
  'less_than',
  'greater_than_or_equal',
  'less_than_or_equal',
  'in',
  'not_in',
  'is_null',
  'is_not_null',
]);

export const ConditionSchema = z.object({
  field: z.string(),
  operator: ConditionOperatorSchema,
  value: z.any(),
});

export const ActionTypeSchema = z.enum([
  'send_email',
  'send_sms',
  'update_status',
  'update_stage',
  'assign_to',
  'create_task',
  'create_activity',
  'add_tag',
  'remove_tag',
  'update_score',
  'trigger_webhook',
  'execute_function',
  'delay',
]);

export const ActionSchema = z.object({
  type: ActionTypeSchema,
  config: z.record(z.any()),
  order: z.number().int().nonnegative().default(0),
  stopOnError: z.boolean().default(false),
});

export const WorkflowSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  
  // Trigger configuration
  trigger: z.object({
    type: TriggerTypeSchema,
    config: z.record(z.any()).optional(),
  }),
  
  // Conditions (all must be true)
  conditions: z.array(ConditionSchema).default([]),
  
  // Actions to execute
  actions: z.array(ActionSchema),
  
  // Settings
  enabled: z.boolean().default(true),
  priority: z.number().int().default(0),
  
  // Metadata
  createdBy: z.string().uuid(),
  tags: z.array(z.string()).default([]),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  lastExecutedAt: z.date().optional(),
  executionCount: z.number().int().nonnegative().default(0),
});

export const WorkflowExecutionSchema = z.object({
  id: z.string().uuid(),
  workflowId: z.string().uuid(),
  
  // Execution context
  trigger: z.object({
    type: TriggerTypeSchema,
    entityType: z.enum(['lead', 'opportunity', 'investor', 'activity']),
    entityId: z.string().uuid(),
    payload: z.record(z.any()),
  }),
  
  // Results
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  
  // Action results
  actionResults: z.array(z.object({
    action: ActionSchema,
    status: z.enum(['pending', 'running', 'completed', 'failed', 'skipped']),
    result: z.any().optional(),
    error: z.string().optional(),
    executedAt: z.date().optional(),
  })).default([]),
  
  // Metadata
  error: z.string().optional(),
  retryCount: z.number().int().nonnegative().default(0),
});

// ============================================================================
// Types
// ============================================================================

export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowExecution = z.infer<typeof WorkflowExecutionSchema>;
export type TriggerType = z.infer<typeof TriggerTypeSchema>;
export type ActionType = z.infer<typeof ActionTypeSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type ConditionOperator = z.infer<typeof ConditionOperatorSchema>;

// ============================================================================
// Workflow Engine
// ============================================================================

interface WorkflowContext {
  entity: Lead | Opportunity | Investor | any;
  trigger: {
    type: TriggerType;
    payload: any;
  };
  metadata: Record<string, any>;
}

export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private actionHandlers: Map<ActionType, (action: Action, context: WorkflowContext) => Promise<any>> = new Map();

  /**
   * Register a workflow
   */
  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  /**
   * Unregister a workflow
   */
  unregisterWorkflow(workflowId: string): void {
    this.workflows.delete(workflowId);
  }

  /**
   * Register an action handler
   */
  registerActionHandler(
    actionType: ActionType,
    handler: (action: Action, context: WorkflowContext) => Promise<any>
  ): void {
    this.actionHandlers.set(actionType, handler);
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(condition: Condition, entity: any): boolean {
    const fieldValue = this.getNestedValue(entity, condition.field);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).includes(condition.value);
      case 'not_contains':
        return !String(fieldValue).includes(condition.value);
      case 'greater_than':
        return fieldValue > condition.value;
      case 'less_than':
        return fieldValue < condition.value;
      case 'greater_than_or_equal':
        return fieldValue >= condition.value;
      case 'less_than_or_equal':
        return fieldValue <= condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      case 'is_null':
        return fieldValue === null || fieldValue === undefined;
      case 'is_not_null':
        return fieldValue !== null && fieldValue !== undefined;
      default:
        return false;
    }
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Check if workflow should execute
   */
  private shouldExecute(workflow: Workflow, context: WorkflowContext): boolean {
    if (!workflow.enabled) return false;

    // Check trigger type matches
    if (workflow.trigger.type !== context.trigger.type) return false;

    // Evaluate all conditions
    return workflow.conditions.every(condition =>
      this.evaluateCondition(condition, context.entity)
    );
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: Action, context: WorkflowContext): Promise<any> {
    const handler = this.actionHandlers.get(action.type);
    
    if (!handler) {
      throw new Error(`No handler registered for action type: ${action.type}`);
    }

    return await handler(action, context);
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    context: WorkflowContext
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const execution: WorkflowExecution = {
      id: crypto.randomUUID(),
      workflowId,
      trigger: {
        type: context.trigger.type,
        entityType: this.inferEntityType(context.entity),
        entityId: context.entity.id,
        payload: context.trigger.payload,
      },
      status: 'pending',
      startedAt: new Date(),
      actionResults: [],
      retryCount: 0,
    };

    try {
      // Check if workflow should execute
      if (!this.shouldExecute(workflow, context)) {
        execution.status = 'cancelled';
        execution.completedAt = new Date();
        return execution;
      }

      execution.status = 'running';

      // Sort actions by order
      const sortedActions = [...workflow.actions].sort((a, b) => a.order - b.order);

      // Execute actions sequentially
      for (const action of sortedActions) {
        const actionResult = {
          action,
          status: 'pending' as const,
          executedAt: undefined as Date | undefined,
          result: undefined as any,
          error: undefined as string | undefined,
        };

        execution.actionResults.push(actionResult);

        try {
          actionResult.status = 'running';
          actionResult.result = await this.executeAction(action, context);
          actionResult.status = 'completed';
          actionResult.executedAt = new Date();
        } catch (error) {
          actionResult.status = 'failed';
          actionResult.error = error instanceof Error ? error.message : String(error);
          actionResult.executedAt = new Date();

          if (action.stopOnError) {
            throw error;
          }
        }
      }

      execution.status = 'completed';
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : String(error);
    } finally {
      execution.completedAt = new Date();
    }

    return execution;
  }

  /**
   * Trigger workflows for an event
   */
  async trigger(
    triggerType: TriggerType,
    entity: any,
    payload: any = {}
  ): Promise<WorkflowExecution[]> {
    const context: WorkflowContext = {
      entity,
      trigger: {
        type: triggerType,
        payload,
      },
      metadata: {},
    };

    // Find workflows that match this trigger type
    const matchingWorkflows = Array.from(this.workflows.values())
      .filter(w => w.trigger.type === triggerType && w.enabled)
      .sort((a, b) => b.priority - a.priority);

    // Execute workflows
    const executions: WorkflowExecution[] = [];
    
    for (const workflow of matchingWorkflows) {
      try {
        const execution = await this.executeWorkflow(workflow.id, context);
        executions.push(execution);
      } catch (error) {
        console.error(`Failed to execute workflow ${workflow.id}:`, error);
      }
    }

    return executions;
  }

  /**
   * Infer entity type from object
   */
  private inferEntityType(entity: any): 'lead' | 'opportunity' | 'investor' | 'activity' {
    // Simple type inference based on properties
    if ('source' in entity && 'status' in entity) return 'lead';
    if ('stage' in entity && 'dealType' in entity) return 'opportunity';
    if ('type' in entity && 'investmentProfile' in entity) return 'investor';
    return 'activity';
  }

  /**
   * Get all workflows
   */
  getWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflows by trigger type
   */
  getWorkflowsByTrigger(triggerType: TriggerType): Workflow[] {
    return Array.from(this.workflows.values())
      .filter(w => w.trigger.type === triggerType);
  }
}

// ============================================================================
// Default Action Handlers
// ============================================================================

export function createDefaultActionHandlers() {
  const handlers = new Map<ActionType, (action: Action, context: WorkflowContext) => Promise<any>>();

  // Email action
  handlers.set('send_email', async (action, context) => {
    const { to, subject, template, data } = action.config;
    console.log(`[Workflow] Sending email to ${to}: ${subject}`);
    // TODO: Integrate with email service
    return { sent: true, to, subject };
  });

  // SMS action
  handlers.set('send_sms', async (action, context) => {
    const { to, message } = action.config;
    console.log(`[Workflow] Sending SMS to ${to}: ${message}`);
    // TODO: Integrate with SMS service
    return { sent: true, to };
  });

  // Update status action
  handlers.set('update_status', async (action, context) => {
    const { status } = action.config;
    console.log(`[Workflow] Updating status to ${status}`);
    context.entity.status = status;
    return { updated: true, newStatus: status };
  });

  // Add tag action
  handlers.set('add_tag', async (action, context) => {
    const { tag } = action.config;
    if (!context.entity.tags) context.entity.tags = [];
    if (!context.entity.tags.includes(tag)) {
      context.entity.tags.push(tag);
    }
    return { added: true, tag };
  });

  // Webhook action
  handlers.set('trigger_webhook', async (action, context) => {
    const { url, method = 'POST', headers = {} } = action.config;
    console.log(`[Workflow] Triggering webhook: ${method} ${url}`);
    // TODO: Implement webhook call
    return { triggered: true, url };
  });

  return handlers;
}

// Singleton instance
export const workflowEngine = new WorkflowEngine();

// Register default handlers
const defaultHandlers = createDefaultActionHandlers();
defaultHandlers.forEach((handler, actionType) => {
  workflowEngine.registerActionHandler(actionType, handler);
});
