import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { StateService } from '../../core/state.service';
import { Task, Role } from '@app/data';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.css']
})
export class TaskBoardComponent {
  stateService = inject(StateService);
  authService = inject(AuthService);

  // Temporary form state
  isCreating = false;
  newTaskTitle = '';
  newTaskDesc = '';

  // Computed signals from service
  openTasks = this.stateService.openTasks;
  inProgressTasks = this.stateService.inProgressTasks;
  doneTasks = this.stateService.doneTasks;

  ngOnInit() {
    this.stateService.loadTasks();
  }

  canCreate() {
    return this.authService.currentUser()?.role !== Role.VIEWER;
  }

  drop(event: CdkDragDrop<Task[]>, newStatus: 'OPEN' | 'IN_PROGRESS' | 'DONE') {
    if (!this.canCreate()) return; // Prevent Viewers from dragging/dropping

    if (event.previousContainer === event.container) {
      // Reordering within same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving to new column
      const task = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      // Update backend
      this.stateService.updateTask(task.id, { status: newStatus }).subscribe({
        error: () => {
          this.stateService.loadTasks();
        }
      });
    }
  }

  createTask() {
    if (!this.newTaskTitle) return;
    this.stateService.addTask({ 
      title: this.newTaskTitle, 
      description: this.newTaskDesc,
      status: 'OPEN',
      assigneeId: this.authService.currentUser()?.id 
    }).subscribe(() => {
      this.isCreating = false;
      this.newTaskTitle = '';
      this.newTaskDesc = '';
    });
  }
  
  deleteTask(id: number) {
    if (confirm('Are you sure?')) {
      this.stateService.deleteTask(id).subscribe();
    }
  }

  clearColumn(status: 'OPEN' | 'IN_PROGRESS' | 'DONE') {
    if (!confirm(`Delete ALL tasks in this column? This cannot be undone.`)) return;
    this.stateService.clearColumn(status).subscribe();
  }
}
