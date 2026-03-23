import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { UserServiceService } from '../../../../core/services/user-service.service';
import { AuthShellComponent } from '../../components/auth-shell/auth-shell.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthShellComponent],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  success = false;
  error = '';
  token = '';
  passwordFocused = false;
  confirmFocused = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserServiceService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.error = 'Invalid or missing reset token.';
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  submit() {
    if (this.form.invalid || !this.token) return;
    this.loading = true;
    this.error = '';

    this.userService.resetPassword(this.token, this.form.value.password).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to reset password. The token may be expired.';
      }
    });
  }
}
