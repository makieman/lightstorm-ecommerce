import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'src/app/core/services/cart.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  showPassword = false;

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: ''
    });
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
    } else if (user.password.length < 8) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Password must be at least 8 characters long!',
      });
      return;
    }
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
          Swal.fire("Error", message, "error");
        }
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
