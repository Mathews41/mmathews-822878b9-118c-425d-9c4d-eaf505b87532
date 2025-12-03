import { Route } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TeamComponent } from './team/team.component';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './core/auth.guard';
import { TaskBoardComponent } from './tasks/task-board/task-board.component';

export const appRoutes: Route[] = [
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'tasks', component: TaskBoardComponent },
      { path: 'team', component: TeamComponent },
      { path: '', redirectTo: 'tasks', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'tasks' }
];
