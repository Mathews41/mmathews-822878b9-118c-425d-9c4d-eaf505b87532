import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { Role, User } from '@app/data';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Team Members</h2>
      
      <!-- Desktop Table View -->
      <div class="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" *ngIf="canManageRoles()">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr *ngFor="let user of users">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                    {{ user.username.charAt(0).toUpperCase() }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.username }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">ID: {{ user.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="{
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': user.role === 'OWNER',
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': user.role === 'ADMIN',
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': user.role === 'VIEWER'
                      }">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" *ngIf="canManageRoles()">
                <div *ngIf="canEditUser(user)" class="flex items-center gap-2">
                  <select [(ngModel)]="user.tempRole" (change)="updateRole(user)" class="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm focus:ring-blue-500 focus:border-blue-500 p-1">
                    <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
                  </select>
                </div>
                <span *ngIf="!canEditUser(user)" class="text-gray-400 dark:text-gray-600 text-xs italic">Cannot edit</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="md:hidden space-y-4">
        <div *ngFor="let user of users" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                {{ user.username.charAt(0).toUpperCase() }}
              </div>
              <div class="ml-3">
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.username }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">ID: {{ user.id }}</div>
              </div>
            </div>
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  [ngClass]="{
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': user.role === 'OWNER',
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': user.role === 'ADMIN',
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': user.role === 'VIEWER'
                  }">
              {{ user.role }}
            </span>
          </div>
          
          <div *ngIf="canManageRoles()" class="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
             <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500 dark:text-gray-400">Role Action:</span>
                <div *ngIf="canEditUser(user)" class="flex items-center gap-2">
                  <select [(ngModel)]="user.tempRole" (change)="updateRole(user)" class="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm focus:ring-blue-500 focus:border-blue-500 p-1">
                    <option *ngFor="let r of roles" [value]="r">{{ r }}</option>
                  </select>
                </div>
                <span *ngIf="!canEditUser(user)" class="text-gray-400 dark:text-gray-600 text-xs italic">Cannot edit</span>
             </div>
          </div>
        </div>
      </div>

      <div *ngIf="loading()" class="p-8 text-center text-gray-500 dark:text-gray-400">
        Loading team members...
      </div>
      <div *ngIf="!loading() && users.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
        No team members found.
      </div>
    </div>
  `
})
export class TeamComponent implements OnInit {
  http = inject(HttpClient);
  authService = inject(AuthService);
  
  users: (User & { tempRole?: Role })[] = [];
  roles = Object.values(Role);
  loading = signal(true);

  ngOnInit() {
    this.loadTeam();
  }

  loadTeam() {
    this.loading.set(true);
    this.http.get<User[]>('http://localhost:3000/api/users').subscribe({
      next: (data) => {
        this.users = data.map(u => ({ ...u, tempRole: u.role }));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  canManageRoles() {
    const currentUserRole = this.authService.currentUser()?.role;
    return currentUserRole === Role.OWNER || currentUserRole === Role.ADMIN;
  }

  canEditUser(targetUser: User) {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;
    if (targetUser.id === currentUser.id) return false; // Can't change own role
    if (currentUser.role === Role.OWNER) return true; // Owner can edit anyone else
    if (currentUser.role === Role.ADMIN && targetUser.role === Role.VIEWER) return true;
    return false;
  }

  updateRole(user: User & { tempRole?: Role }) {
    if (!user.tempRole || user.tempRole === user.role) return;
    
    if (!confirm(`Change role of ${user.username} to ${user.tempRole}?`)) {
      user.tempRole = user.role; // Revert
      return;
    }

    this.http.put(`http://localhost:3000/api/users/${user.id}/role`, { role: user.tempRole }).subscribe({
      next: () => {
        user.role = user.tempRole!;
      },
      error: () => {
        alert('Failed to update role');
        user.tempRole = user.role; // Revert
      }
    });
  }
}
