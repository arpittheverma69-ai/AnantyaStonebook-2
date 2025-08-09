import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "react-router-dom";

export default function TasksWidget() {
  const queryClient = useQueryClient();
  
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      return apiRequest("PATCH", `/api/tasks/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  // Filter tasks for today
  const today = new Date();
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  });

  // Show only first 3 tasks
  const displayTasks = todayTasks.slice(0, 3);

  const handleTaskToggle = (id: string, completed: boolean) => {
    updateTaskMutation.mutate({ id, completed });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-blue-100 text-blue-800';
      case 'Low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: string | Date | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Card className="card-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Today's Tasks</CardTitle>
          <Link to="/tasks">
            <Button variant="link" className="text-primary">View All Tasks</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tasks for today</p>
              <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
            </div>
          ) : (
            displayTasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-start space-x-3 p-3 border border-gray-200 rounded-lg ${
                  task.completed ? 'bg-green-50' : ''
                }`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked) => handleTaskToggle(task.id, !!checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  <p className="text-sm text-gray-500">{task.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge className={getPriorityColor(task.priority || 'Medium')}>
                      {task.priority || 'Medium'} Priority
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Due: {formatTime(task.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
