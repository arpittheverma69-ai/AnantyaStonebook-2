import { geminiService } from "./gemini-service";
import { storage } from "./storage";

export interface TaskAutomation {
  id: string;
  name: string;
  trigger: 'daily' | 'weekly' | 'monthly' | 'event-based';
  conditions: string[];
  actions: string[];
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedDuration: number; // in minutes
  category: string;
  tags: string[];
  checklist: string[];
}

export class TaskAutomationService {
  private automationRules: TaskAutomation[] = [
    {
      id: '1',
      name: 'Inventory Check',
      trigger: 'daily',
      conditions: ['inventory_count < 10'],
      actions: ['create_task: "Restock low inventory items"', 'send_notification: "Low stock alert"'],
      isActive: true
    },
    {
      id: '2',
      name: 'Client Follow-up',
      trigger: 'weekly',
      conditions: ['last_client_contact > 7_days'],
      actions: ['create_task: "Follow up with inactive clients"', 'schedule_reminder'],
      isActive: true
    },
    {
      id: '3',
      name: 'Sales Review',
      trigger: 'monthly',
      conditions: ['month_end'],
      actions: ['create_task: "Monthly sales analysis"', 'generate_report'],
      isActive: true
    }
  ];

  private taskTemplates: TaskTemplate[] = [
    {
      id: '1',
      name: 'Inventory Audit',
      description: 'Complete inventory count and quality check',
      priority: 'High',
      estimatedDuration: 120,
      category: 'Inventory',
      tags: ['audit', 'quality', 'count'],
      checklist: [
        'Count all items',
        'Check for damage',
        'Update records',
        'Generate report'
      ]
    },
    {
      id: '2',
      name: 'Client Meeting',
      description: 'Prepare for and conduct client meeting',
      priority: 'Medium',
      estimatedDuration: 60,
      category: 'Sales',
      tags: ['meeting', 'client', 'presentation'],
      checklist: [
        'Review client history',
        'Prepare presentation',
        'Schedule meeting',
        'Follow up notes'
      ]
    },
    {
      id: '3',
      name: 'Supplier Negotiation',
      description: 'Negotiate prices and terms with suppliers',
      priority: 'High',
      estimatedDuration: 90,
      category: 'Procurement',
      tags: ['negotiation', 'supplier', 'pricing'],
      checklist: [
        'Research market prices',
        'Prepare negotiation points',
        'Schedule meeting',
        'Document agreement'
      ]
    }
  ];

  async generateSmartTasks(): Promise<any[]> {
    try {
      // Fetch business data
      const [sales, inventory, clients, suppliers] = await Promise.all([
        storage.getSales(),
        storage.getInventory(),
        storage.getClients(),
        storage.getSuppliers()
      ]);

      // Analyze data and generate smart tasks
      const analysis = await geminiService.analyzeBusinessData({
        query: "Based on this business data, suggest 3-5 specific tasks that should be prioritized. Focus on actionable items that will improve business performance.",
        context: "task-generation"
      });

      // Parse AI response and create task suggestions
      const taskSuggestions = this.parseTaskSuggestions(analysis.content);
      
      return taskSuggestions.map((suggestion, index) => ({
        id: `smart-${Date.now()}-${index}`,
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        category: suggestion.category,
        estimatedDuration: suggestion.duration,
        aiGenerated: true,
        confidence: suggestion.confidence
      }));
    } catch (error) {
      console.error('Error generating smart tasks:', error);
      return [];
    }
  }

  private parseTaskSuggestions(aiResponse: string): any[] {
    // Parse AI response to extract task suggestions
    const suggestions: any[] = [];
    const lines = aiResponse.split('\n');
    
    let currentTask: any = {};
    
    for (const line of lines) {
      if (line.includes('•') || line.includes('-')) {
        const taskText = line.replace(/^[•\-\s]+/, '').trim();
        if (taskText.length > 10) {
          currentTask = {
            title: taskText,
            description: taskText,
            priority: this.determinePriority(taskText),
            category: this.determineCategory(taskText),
            duration: 60, // default 1 hour
            confidence: 0.8
          };
          suggestions.push(currentTask);
        }
      }
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  private determinePriority(taskText: string): 'High' | 'Medium' | 'Low' {
    const highPriorityKeywords = ['urgent', 'critical', 'immediate', 'emergency', 'deadline'];
    const lowPriorityKeywords = ['optional', 'nice to have', 'when possible', 'low priority'];
    
    const text = taskText.toLowerCase();
    
    if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
      return 'High';
    }
    
    if (lowPriorityKeywords.some(keyword => text.includes(keyword))) {
      return 'Low';
    }
    
    return 'Medium';
  }

  private determineCategory(taskText: string): string {
    const text = taskText.toLowerCase();
    
    if (text.includes('inventory') || text.includes('stock') || text.includes('item')) {
      return 'Inventory';
    }
    
    if (text.includes('client') || text.includes('customer') || text.includes('meeting')) {
      return 'Sales';
    }
    
    if (text.includes('supplier') || text.includes('purchase') || text.includes('buy')) {
      return 'Procurement';
    }
    
    if (text.includes('finance') || text.includes('money') || text.includes('budget')) {
      return 'Finance';
    }
    
    return 'General';
  }

  async getTaskTemplates(): Promise<TaskTemplate[]> {
    return this.taskTemplates;
  }

  async createTaskFromTemplate(templateId: string, customizations: any = {}): Promise<any> {
    const template = this.taskTemplates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    return {
      title: customizations.title || template.name,
      description: customizations.description || template.description,
      priority: customizations.priority || template.priority,
      estimatedDuration: customizations.estimatedDuration || template.estimatedDuration,
      category: customizations.category || template.category,
      tags: customizations.tags || template.tags,
      checklist: customizations.checklist || template.checklist,
      dueDate: customizations.dueDate || this.calculateDefaultDueDate(template.priority)
    };
  }

  private calculateDefaultDueDate(priority: string): Date {
    const now = new Date();
    
    switch (priority) {
      case 'High':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      case 'Medium':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
      case 'Low':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
    }
  }

  async getAutomationRules(): Promise<TaskAutomation[]> {
    return this.automationRules;
  }

  async runAutomationChecks(): Promise<any[]> {
    const triggeredTasks: any[] = [];
    
    for (const rule of this.automationRules) {
      if (!rule.isActive) continue;
      
      const shouldTrigger = await this.evaluateRuleConditions(rule);
      if (shouldTrigger) {
        const newTasks = await this.executeRuleActions(rule);
        triggeredTasks.push(...newTasks);
      }
    }
    
    return triggeredTasks;
  }

  private async evaluateRuleConditions(rule: TaskAutomation): Promise<boolean> {
    // Simple condition evaluation - in a real system, this would be more sophisticated
    for (const condition of rule.conditions) {
      if (condition.includes('inventory_count < 10')) {
        const inventory = await storage.getInventory();
        const lowStockItems = inventory.filter(item => 
          parseInt(item.quantity || '0') < 10
        );
        if (lowStockItems.length > 0) {
          return true;
        }
      }
      
      if (condition.includes('month_end')) {
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        if (today.getDate() === lastDayOfMonth.getDate()) {
          return true;
        }
      }
    }
    
    return false;
  }

  private async executeRuleActions(rule: TaskAutomation): Promise<any[]> {
    const newTasks: any[] = [];
    
    for (const action of rule.actions) {
      if (action.startsWith('create_task:')) {
        const taskTitle = action.replace('create_task:', '').trim();
        const newTask = {
          title: taskTitle,
          description: `Automatically generated by rule: ${rule.name}`,
          priority: 'Medium',
          status: 'Pending',
          completed: false,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
          automationRule: rule.id
        };
        newTasks.push(newTask);
      }
    }
    
    return newTasks;
  }

  async getTaskInsights(): Promise<any> {
    try {
      const tasks = await storage.getTasks();
      
      const insights = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        pendingTasks: tasks.filter(t => !t.completed).length,
        overdueTasks: tasks.filter(t => !t.completed && new Date(t.dueDate || '') < new Date()).length,
        averageCompletionTime: this.calculateAverageCompletionTime(tasks),
        mostProductiveDay: this.findMostProductiveDay(tasks),
        priorityDistribution: this.getPriorityDistribution(tasks),
        categoryBreakdown: this.getCategoryBreakdown(tasks)
      };
      
      return insights;
    } catch (error) {
      console.error('Error getting task insights:', error);
      return {};
    }
  }

  private calculateAverageCompletionTime(tasks: any[]): number {
    const completedTasks = tasks.filter(t => t.completed && t.dueDate);
    if (completedTasks.length === 0) return 0;
    
    const totalTime = completedTasks.reduce((sum, task) => {
      const dueDate = new Date(task.dueDate);
      const completedDate = new Date(task.updatedAt || task.createdAt);
      return sum + Math.abs(completedDate.getTime() - dueDate.getTime());
    }, 0);
    
    return totalTime / completedTasks.length / (1000 * 60 * 60 * 24); // Convert to days
  }

  private findMostProductiveDay(tasks: any[]): string {
    const dayCounts: { [key: string]: number } = {};
    
    tasks.forEach(task => {
      if (task.completed && task.updatedAt) {
        const day = new Date(task.updatedAt).toLocaleDateString('en-US', { weekday: 'long' });
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    });
    
    return Object.entries(dayCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
  }

  private getPriorityDistribution(tasks: any[]): any {
    const distribution: { [key: string]: number } = {};
    
    tasks.forEach(task => {
      const priority = task.priority || 'Medium';
      distribution[priority] = (distribution[priority] || 0) + 1;
    });
    
    return distribution;
  }

  private getCategoryBreakdown(tasks: any[]): any {
    const breakdown: { [key: string]: number } = {};
    
    tasks.forEach(task => {
      const category = task.relatedType || 'General';
      breakdown[category] = (breakdown[category] || 0) + 1;
    });
    
    return breakdown;
  }
}

export const taskAutomationService = new TaskAutomationService();
