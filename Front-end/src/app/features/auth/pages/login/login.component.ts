import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CartService } from '@app/core/services/cart.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { CommonModule } from '@angular/common';
import { AuthShellComponent } from '../../components/auth-shell/auth-shell.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, AuthShellComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  showPassword = false;
  showVerificationBanner = false;
  resendEmail = '';
  resendLoading = false;
  resendSent = false;
  emailFocused = false;
  passwordFocused = false;

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // Check for ?verified=true query param
    const verified = this.route.snapshot.queryParamMap.get('verified');
    if (verified === 'true') {
      Swal.fire({
        icon: 'success',
        title: 'Email Verified!',
        text: 'Your account has been activated. You can now log in.',
        confirmButtonColor: '#EF4444',
        timer: 4000,
        timerProgressBar: true,
      });
    }
  }

  login() {
    let user = this.form.getRawValue();
    const emailRegex: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!emailRegex.test(user.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Invalid email!',
      });
      return;
    }

    // Reset verification banner state
    this.showVerificationBanner = false;
    this.resendSent = false;

    this.http.post<any>('/api/users/login', user, { withCredentials: true })
      .subscribe({
        next: (response) => {
          let loggedInUser = response.user;
          if (loggedInUser && loggedInUser.isAdmin == true) {
            Swal.fire({
              icon: 'success',
              title: `Welcome ${loggedInUser.username}!`,
              text: 'You are logged in successfully!',
            })
            this.router.navigate(['/admin']);
          }
          else if (loggedInUser && loggedInUser.isAdmin == false) {
            Swal.fire({
              icon: 'success',
              title: `Welcome ${loggedInUser.username}!`,
              text: 'You are logged in successfully!',
            });

            // Sync guest cart with backend
            this.cartService.syncCartWithBackend(loggedInUser._id).subscribe({
              next: () => {
                const redirect = this.route.snapshot.queryParamMap.get('redirect');
                this.router.navigateByUrl(redirect || '/home');
              },
              error: () => {
                // Even if sync fails, proceed to navigation
                const redirect = this.route.snapshot.queryParamMap.get('redirect');
                this.router.navigateByUrl(redirect || '/home');
              }
            });
          }

        },
        error: (error) => {
          const message = error?.error?.message || error?.message || "Login failed. Please try again.";

          // Check if it's an unverified email error
          if (error?.status === 401 && message.toLowerCase().includes('verify')) {
            this.showVerificationBanner = true;
            this.resendEmail = user.email;
          } else {
            Swal.fire("Error", message, "error");
          }
        }
      });
  }

  resendVerification(): void {
    if (!this.resendEmail) return;
    this.resendLoading = true;
    this.http
      .post<any>('/api/users/resend-verification', { email: this.resendEmail }, { withCredentials: true })
      .subscribe({
        next: () => {
          this.resendLoading = false;
          this.resendSent = true;
        },
        error: (err) => {
          this.resendLoading = false;
          Swal.fire('Error', err?.error?.message || 'Could not resend verification email.', 'error');
        },
      });
  }

  checkLogin() {
    this.http.get<any>('/api/users/user/user', { withCredentials: true }).subscribe({
      next: (response) => {
        if (response.data) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'You Are Already Logged In!',
          })
          this.router.navigate(['/home']);
        }
        else {
          this.router.navigate(['/login']);
        }
      }
    })
  }
}
