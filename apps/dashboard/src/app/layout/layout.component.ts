import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Role } from '@app/data';
import { TaskStatsComponent } from '../tasks/task-stats/task-stats.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TaskStatsComponent],
  template: `
    <div
      class="flex h-screen bg-gray-100 font-sans relative transition-colors duration-300 dark:bg-gray-900"
    >
      <!-- Mobile Header -->
      <header
        class="bg-gray-900 text-white p-4 flex justify-between items-center md:hidden fixed top-0 left-0 w-full z-50 shadow-lg"
      >
        <div class="flex items-center gap-2">
          <button
            (click)="toggleSidebar()"
            class="text-gray-300 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span class="font-bold text-blue-400">TaskFlow</span>
        </div>
      </header>

      <!-- Overlay -->
      <div
        *ngIf="sidebarOpen()"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        (click)="closeSidebar()"
      ></div>

      <!-- Sidebar -->
      <aside
        [class.-translate-x-full]="!sidebarOpen()"
        class="w-64 bg-gray-900 text-white flex flex-col shadow-xl fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:translate-x-0 md:static md:inset-auto border-r border-gray-800"
      >
        <div
          class="p-6 border-b border-gray-800 flex justify-between items-center"
        >
          <div>
            <h2 class="text-2xl font-bold tracking-tight text-blue-400">
              TaskFlow
            </h2>
            <p class="text-xs text-gray-500 mt-1">Efficient Task Management</p>
          </div>
          <button
            (click)="closeSidebar()"
            class="md:hidden text-gray-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav class="flex-1 p-4 space-y-2">
          <a
            routerLink="/tasks"
            routerLinkActive="bg-gray-800 text-blue-400"
            (click)="closeSidebar()"
            class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            Board
          </a>

          <ng-container *ngIf="canAccessRestrictedFeatures()">
            <a
              routerLink="/team"
              routerLinkActive="bg-gray-800 text-blue-400"
              (click)="closeSidebar()"
              class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"
                />
              </svg>
              Team
            </a>
          </ng-container>
        </nav>

        <div class="p-4 border-t border-gray-800 space-y-4">
          <!-- Dark Mode Toggle -->
          <button
            (click)="toggleDarkMode()"
            class="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white transition-colors w-full rounded-lg hover:bg-gray-800"
          >
            <svg
              *ngIf="!isDarkMode()"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
            <svg
              *ngIf="isDarkMode()"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            {{ isDarkMode() ? 'Light Mode' : 'Dark Mode' }}
          </button>

          <div class="flex items-center gap-3 px-2">
            <div
              class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow"
            >
              {{ getInitials(authService.currentUser()?.username) }}
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-sm font-semibold truncate">{{
                authService.currentUser()?.username
              }}</span>
              <span
                class="text-xs text-gray-400 truncate uppercase tracking-wider"
                >{{ authService.currentUser()?.role }}</span
              >
            </div>
          </div>
          <button
            (click)="authService.logout()"
            class="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-600 hover:text-white text-gray-300 py-2 rounded-md transition-all text-sm font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main
        class="flex-1 flex flex-col overflow-hidden pt-14 md:pt-0 dark:bg-gray-900 dark:text-white transition-colors duration-300"
      >
        <header
          class="bg-white dark:bg-gray-800 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center border-b dark:border-gray-700 gap-4 transition-colors duration-300"
        >
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Task Manager
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">Dashboard</p>
          </div>
          <div
            class="text-sm text-gray-500 dark:text-gray-400 w-full md:w-auto bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 md:border-0 md:bg-transparent transition-colors"
          >
            Organization:
            <span
              class="font-semibold text-gray-800 dark:text-gray-200 break-all"
              >{{
                authService.currentUser()?.organization?.name ||
                  authService.currentUser()?.organizationId
              }}</span
            >
          </div>
        </header>

        <div class="flex-1 overflow-auto p-4 md:p-8">
          <!-- Show stats only on tasks route -->
          <app-task-stats *ngIf="showStats()"></app-task-stats>
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
})
export class LayoutComponent {
  authService = inject(AuthService);
  router = inject(Router);
  sidebarOpen = signal(false);
  isDarkMode = signal(false);
  showStats = signal(false);

  constructor() {
    // Initialize dark mode from local storage
    const savedTheme = localStorage.getItem('theme');
    if (
      savedTheme === 'dark' ||
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      this.isDarkMode.set(true);
      document.documentElement.classList.add('dark');
    } else {
      this.isDarkMode.set(false);
      document.documentElement.classList.remove('dark');
    }

    // Initialize showStats based on current URL
    this.checkUrl(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkUrl(event.urlAfterRedirects || event.url);
      });
  }

  checkUrl(url: string) {
    this.showStats.set(url.includes('/tasks') || url === '/');
  }

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  getInitials(name: string | undefined): string {
    return name ? name.substring(0, 2).toUpperCase() : '??';
  }

  canAccessRestrictedFeatures(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === Role.OWNER || role === Role.ADMIN;
  }

  toggleDarkMode() {
    this.isDarkMode.update((v) => !v);
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
