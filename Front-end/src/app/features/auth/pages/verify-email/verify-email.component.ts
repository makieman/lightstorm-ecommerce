import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-verify-email',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './verify-email.component.html',
    styleUrl: './verify-email.component.css',
})
export class VerifyEmailComponent implements OnInit {
    status: 'loading' | 'success' | 'error' = 'loading';
    errorMessage = '';
    resendEmail = '';
    resendLoading = false;
    resendSent = false;

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        const token = this.route.snapshot.queryParamMap.get('token');
        if (!token) {
            this.status = 'error';
            this.errorMessage = 'No verification token found in the URL.';
            return;
        }
        this.http
            .post<any>('/api/users/verify-email', { token }, { withCredentials: true })
            .subscribe({
                next: (res) => {
                    this.status = 'success';
                    setTimeout(() => this.router.navigate(['/home']), 3500);
                },
                error: (err) => {
                    this.status = 'error';
                    this.errorMessage =
                        err?.error?.message || 'Invalid or expired verification link.';
                },
            });
    }

    resendVerification(): void {
        if (!this.resendEmail) {
            Swal.fire('Error', 'Please enter your email address.', 'error');
            return;
        }
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
}
