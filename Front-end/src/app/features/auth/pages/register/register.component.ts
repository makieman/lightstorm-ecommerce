import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { AuthShellComponent } from '../../components/auth-shell/auth-shell.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, AuthShellComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  showPassword = false;
  showConPassword = false;
  usernameFocused = false;
  usernameError: string = '';
  emailFocused = false;
  emailError: string = '';
  passwordFocused = false;
  passwordError: string = '';
  confirmPasswordFocused = false;
  confirmPasswordError: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  get passwordMismatch(): boolean {
    if (!this.form) return false;
    const password = this.form.get('password')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword;
  }

  submit() {
    let user = this.form.getRawValue();
    const emailRegex: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (user.username.length < 3) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Username must be at least 3 characters long!',
      });
      return;
    } else if (!emailRegex.test(user.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Invalid email!',
      });
      return;
    } else if (user.password !== user.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Passwords do not match!',
      });
      return;
    } else if (user.password.length < 8) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Password must be at least 8 characters long!',
      });
      return;
    }
    this.http.post<any>('/api/users/register', user,
      {
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Account Created!',
            html: `We've sent a verification link to <b>${user.email}</b>.<br>Please check your inbox to activate your account.`,
            confirmButtonColor: '#EF4444',
            confirmButtonText: 'Go to Login',
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          Swal.fire("Error", err.error.message, "error");
        }
      });
  }
}
