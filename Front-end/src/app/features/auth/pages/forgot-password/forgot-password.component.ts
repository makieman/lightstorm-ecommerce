import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserServiceService } from '../../../../core/services/user-service.service';
import { AuthShellComponent } from '../../components/auth-shell/auth-shell.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthShellComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = false;
  success = false;
  error = '';
  emailFocused = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserServiceService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.userService.forgotPassword(this.form.value.email).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to send reset email.';
      }
    });
  }
}
