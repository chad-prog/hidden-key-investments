/**
 * AI Agent Framework
 * 
 * Base infrastructure for all AI agents including:
 * - Agent interface definition
 * - Agent registry and management
 * - Communication protocol
 * - Task execution framework
 * - Monitoring and logging
 */

export type AgentRole = 'steve' | 'maya' | 'lex' | 'nova' | 'ava';
export type AgentStatus = 'idle' | 'processing' | 'error' | 'offline';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface AgentCapability {
  name: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
}

export interface AgentTask {
  id: string;
  agentRole: AgentRole;
  type: string;
  priority: TaskPriority;
  status: TaskStatus;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface AgentConfig {
  role: AgentRole;
  name: string;
  description: string;
  version: string;
  capabilities: AgentCapability[];
  maxConcurrentTasks: number;
  timeoutMs: number;
}

export interface AgentMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  successRate: number;
  uptime: number;
}

/**
 * Base Agent Interface
 * All AI agents must implement this interface
 */
export abstract class BaseAgent {
  protected config: AgentConfig;
  protected status: AgentStatus = 'idle';
  protected currentTasks: Map<string, AgentTask> = new Map();
  protected metrics: AgentMetrics = {
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    averageExecutionTime: 0,
    successRate: 0,
    uptime: 100
  };

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Execute a task
   */
  abstract executeTask(task: AgentTask): Promise<AgentTask>;

  /**
   * Validate if the agent can handle this task
   */
  abstract canHandle(taskType: string): boolean;

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Get current status
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * Get metrics
   */
  getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }

  /**
   * Submit a task to this agent
   */
  async submitTask(task: AgentTask): Promise<AgentTask> {
    if (!this.canHandle(task.type)) {
      throw new Error(`Agent ${this.config.role} cannot handle task type: ${task.type}`);
    }

    if (this.currentTasks.size >= this.config.maxConcurrentTasks) {
      throw new Error(`Agent ${this.config.role} is at capacity`);
    }

    task.status = 'in_progress';
    task.startedAt = new Date();
    this.currentTasks.set(task.id, task);
    this.status = 'processing';
    this.metrics.totalTasks++;

    try {
      const result = await this.executeTask(task);
      result.status = 'completed';
      result.completedAt = new Date();
      
      this.metrics.completedTasks++;
      this.updateMetrics(result);
      
      return result;
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.completedAt = new Date();
      
      this.metrics.failedTasks++;
      this.updateMetrics(task);
      
      throw error;
    } finally {
      this.currentTasks.delete(task.id);
      if (this.currentTasks.size === 0) {
        this.status = 'idle';
      }
    }
  }

  /**
   * Update agent metrics
   */
  protected updateMetrics(task: AgentTask): void {
    if (task.startedAt && task.completedAt) {
      const executionTime = task.completedAt.getTime() - task.startedAt.getTime();
      const totalTime = this.metrics.averageExecutionTime * (this.metrics.totalTasks - 1);
      this.metrics.averageExecutionTime = (totalTime + executionTime) / this.metrics.totalTasks;
    }

    if (this.metrics.totalTasks > 0) {
      this.metrics.successRate = (this.metrics.completedTasks / this.metrics.totalTasks) * 100;
    }
  }

  /**
   * Log agent activity
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      agent: this.config.role,
      level,
      message,
      data
    };
    
    // In production, this would send to a logging service
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Agent Registry
 * Manages all registered agents
 */
export class AgentRegistry {
  private agents: Map<AgentRole, BaseAgent> = new Map();

  /**
   * Register an agent
   */
  register(agent: BaseAgent): void {
    const role = agent.getConfig().role;
    if (this.agents.has(role)) {
      throw new Error(`Agent with role ${role} is already registered`);
    }
    this.agents.set(role, agent);
  }

  /**
   * Get an agent by role
   */
  getAgent(role: AgentRole): BaseAgent | undefined {
    return this.agents.get(role);
  }

  /**
   * Get all agents
   */
  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Find an agent that can handle a task type
   */
  findAgentForTask(taskType: string): BaseAgent | undefined {
    return Array.from(this.agents.values()).find(agent => agent.canHandle(taskType));
  }

  /**
   * Get registry status
   */
  getStatus(): Record<AgentRole, { status: AgentStatus; metrics: AgentMetrics }> {
    const status: any = {};
    this.agents.forEach((agent, role) => {
      status[role] = {
        status: agent.getStatus(),
        metrics: agent.getMetrics()
      };
    });
    return status;
  }
}

/**
 * Task Queue
 * Manages task distribution to agents
 */
export class TaskQueue {
  private queue: AgentTask[] = [];
  private registry: AgentRegistry;

  constructor(registry: AgentRegistry) {
    this.registry = registry;
  }

  /**
   * Add a task to the queue
   */
  enqueue(task: AgentTask): void {
    this.queue.push(task);
    this.queue.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
  }

  /**
   * Process the next task in queue
   */
  async processNext(): Promise<AgentTask | null> {
    if (this.queue.length === 0) {
      return null;
    }

    const task = this.queue[0];
    const agent = this.registry.getAgent(task.agentRole);

    if (!agent) {
      throw new Error(`No agent registered for role: ${task.agentRole}`);
    }

    this.queue.shift();
    return await agent.submitTask(task);
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Clear the queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Get priority numeric value
   */
  private getPriorityValue(priority: TaskPriority): number {
    const values: Record<TaskPriority, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };
    return values[priority];
  }
}

/**
 * Create a new task
 */
export function createTask(
  agentRole: AgentRole,
  type: string,
  input: Record<string, any>,
  priority: TaskPriority = 'medium',
  metadata?: Record<string, any>
): AgentTask {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    agentRole,
    type,
    priority,
    status: 'pending',
    input,
    metadata,
    createdAt: new Date()
  };
}

/**
 * Global agent registry instance
 */
export const agentRegistry = new AgentRegistry();

/**
 * Global task queue instance
 */
export const taskQueue = new TaskQueue(agentRegistry);
