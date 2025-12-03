import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task, CreateTaskDto, UpdateTaskDto } from '@app/data';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private apiUrl = 'http://localhost:3000/api/tasks';
  
  private tasksSignal = signal<Task[]>([]);
  
  // Public signals
  tasks = computed(() => this.tasksSignal());
  
  // Derived state
  openTasks = computed(() => this.tasksSignal().filter(t => t.status === 'OPEN'));
  inProgressTasks = computed(() => this.tasksSignal().filter(t => t.status === 'IN_PROGRESS'));
  doneTasks = computed(() => this.tasksSignal().filter(t => t.status === 'DONE'));

  constructor(private http: HttpClient) {}

  loadTasks() {
    this.http.get<Task[]>(this.apiUrl).subscribe(tasks => {
      this.tasksSignal.set(tasks);
    });
  }

  addTask(taskDto: CreateTaskDto) {
    return this.http.post<Task>(this.apiUrl, taskDto).pipe(
      tap(newTask => {
        this.tasksSignal.update(tasks => [newTask, ...tasks]);
      })
    );
  }

  updateTask(id: number, changes: UpdateTaskDto) {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, changes).pipe(
      tap(updatedTask => {
        this.tasksSignal.update(tasks => 
          tasks.map(t => t.id === id ? updatedTask : t)
        );
      })
    );
  }

  deleteTask(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.tasksSignal.update(tasks => tasks.filter(t => t.id !== id));
      })
    );
  }

  clearColumn(status: string) {
    return this.http.delete(`${this.apiUrl}?status=${status}`).pipe(
      tap(() => {
        this.tasksSignal.update(tasks => tasks.filter(t => t.status !== status));
      })
    );
  }
}
