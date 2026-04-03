import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Front-end';
  hideShell = false;

  // Routes that have their own full-page layout (no global header/footer)
  private readonly shelllessRoutes = ['/profile', '/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: NavigationEnd) => {
      this.hideShell = this.shelllessRoutes.some(route => e.urlAfterRedirects.startsWith(route));
    });
  }
}
