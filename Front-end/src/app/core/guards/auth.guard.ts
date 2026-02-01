import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private http: HttpClient, private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return this.http.get<any>("/api/users/user/user", { withCredentials: true })
      .pipe(
        map(response => {
          if (response.data.isAdmin) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: "Admins Can't Access This Page!",
            });
            this.router.navigate(['/admin']);
            return false;
          }
          return true;
        }),
        catchError(error => {
          // Redirect to login with the current URL as a redirect parameter
          this.router.navigate(['/login'], {
            queryParams: { redirect: state.url }
          });
          return of(false);
        })
      );
  }
}
