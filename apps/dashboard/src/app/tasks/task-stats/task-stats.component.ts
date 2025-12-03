import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../core/state.service';

@Component({
  selector: 'app-task-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 transition-colors">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Progress Overview</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 flex flex-col justify-center h-24">
          <span class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Total Tasks</span>
          <div class="text-3xl font-bold text-gray-900 dark:text-white leading-none">{{ totalTasks() }}</div>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800 flex flex-col justify-center h-24">
          <span class="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider font-bold mb-1">Completed</span>
          <div class="text-3xl font-bold text-green-700 dark:text-green-300 leading-none">{{ doneCount() }}</div>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 flex flex-col justify-center h-24">
          <span class="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider font-bold mb-1">Completion Rate</span>
          <div class="text-3xl font-bold text-blue-700 dark:text-blue-300 leading-none">{{ completionRate() }}%</div>
        </div>
      </div>

      <div class="relative pt-1">
        <div class="flex mb-2 items-center justify-between">
          <div class="text-right w-full">
            <span class="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
              {{ completionRate() }}%
            </span>
          </div>
        </div>
        <div class="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
          <div [style.width.%]="completionRate()" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"></div>
        </div>
      </div>
    </div>
  `
})
export class TaskStatsComponent {
  stateService = inject(StateService);
  
  doneCount() {
    return this.stateService.doneTasks().length;
  }
  
  totalTasks() {
    return this.stateService.tasks().length;
  }
  
  completionRate() {
    const total = this.totalTasks();
    if (total === 0) return 0;
    return Math.round((this.doneCount() / total) * 100);
  }
}
