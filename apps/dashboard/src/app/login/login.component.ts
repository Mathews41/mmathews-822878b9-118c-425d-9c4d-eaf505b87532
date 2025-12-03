import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';
import { Role } from '@app/data';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);

  isLogin = true;
  message = '';
  isSuccess = false;
  isDarkMode = signal(false);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    // Register fields
    role: [Role.VIEWER],
    orgName: [''],
  });

  roles = Object.values(Role);

  ngOnInit() {
    // Check local storage for dark mode preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkMode.set(true);
      document.documentElement.classList.add('dark');
    } else {
      this.isDarkMode.set(false);
      document.documentElement.classList.remove('dark');
    }
  }

  toggleDarkMode() {
    this.isDarkMode.update(v => !v);
    if (this.isDarkMode()) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  forgotPassword() {
    alert('Please contact your organization administrator to reset your password.');
  }

  async onSubmit() {
    if (this.form.invalid) return;

    const { username, password, role, orgName } = this.form.value;
    if (!username || !password) return;

    this.message = '';
    this.isSuccess = false;

    try {
      if (this.isLogin) {
        this.authService.login({ username, password }).subscribe({
          next: () => this.router.navigate(['/tasks']),
          error: () => {
            this.message = 'Invalid credentials';
            this.isSuccess = false;
          }
        });
      } else {
        // Register
        if (!orgName) {
          this.message = 'Organization Name is required for registration';
          this.isSuccess = false;
          return;
        }
        this.authService.register({ username, password, role, orgName }).subscribe({
          next: () => {
            this.isLogin = true; // Switch to login
            this.message = 'Registration successful! Please login.';
            this.isSuccess = true;
          },
          error: () => {
            this.message = 'Registration failed';
            this.isSuccess = false;
          }
        });
      }
    } catch (e) {
      this.message = 'An error occurred';
      this.isSuccess = false;
    }
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.message = '';
    this.isSuccess = false;
  }
}
