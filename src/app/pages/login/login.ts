import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router';
import { AuthService, Role } from '../../services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // mode: 'login' | 'register'
  mode = signal<'login' | 'register'>('login');
  loading = signal(false);
  error = signal<string | null>(null);

  // Base form controls
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],

    // Only used in "register" mode
    role: ['SEEKER' as Role] // default; validator applied conditionally
  });

  isLogin = computed(() => this.mode() === 'login');
  isRegister = computed(() => this.mode() === 'register');

  switchTo(mode: 'login' | 'register') {
    this.mode.set(mode);
    this.error.set(null);

    // Add/remove role validator depending on mode
    const roleCtrl = this.form.get('role');
    if (mode === 'register') {
      roleCtrl?.addValidators([Validators.required]);
    } else {
      roleCtrl?.clearValidators();
    }
    roleCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  get emailInvalid() { const c = this.form.get('email'); return c?.touched && c.invalid; }
  get passwordInvalid() { const c = this.form.get('password'); return c?.touched && c.invalid; }
  get roleInvalid() { const c = this.form.get('role'); return c?.touched && c.invalid; }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    try {
      const { email, password, role } = this.form.value;

      if (this.isLogin()) {
        const user = await this.auth.login(email!, password!);
        this.router.navigateByUrl(user.role === 'SPONSOR' ? '/sponsor' : '/seeker');
      } else {
        const user = await this.auth.register({ email: email!, password: password!, role: role as Role });
        this.router.navigateByUrl(user.role === 'SPONSOR' ? '/sponsor' : '/seeker');
      }
    } catch (e: any) {
      // Prefer backend-provided message if available
      const msg = e?.error?.message ?? e?.message ?? 'Request failed.';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}
