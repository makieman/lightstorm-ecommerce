import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BannerComponent } from './components/banner/banner.component';
import { ProductComponent } from './components/product/product.component';

interface SolutionCategory {
  name: string;
  categoryFilter: string; // Exact match to DB category name
  icon: string;
  color: string;
  hoverColor: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    BannerComponent,
    ProductComponent,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  solutions: SolutionCategory[] = [
    { name: 'Solar Panel', categoryFilter: 'Solar Panel', icon: 'bi-sun', color: '#84CC16', hoverColor: 'hover:shadow-green-500/30' },
    { name: 'Inverters', categoryFilter: 'Inverter', icon: 'bi-gear-wide-connected', color: '#14B8A6', hoverColor: 'hover:shadow-teal-500/30' },
    { name: 'Batteries', categoryFilter: 'Battery', icon: 'bi-battery-charging', color: '#6366F1', hoverColor: 'hover:shadow-indigo-500/30' },
    { name: 'Lighting', categoryFilter: 'Solar Lighting', icon: 'bi-lightbulb', color: '#F43F5E', hoverColor: 'hover:shadow-rose-500/30' },
    { name: 'Mounting', categoryFilter: 'Mounting Systems', icon: 'bi-tools', color: '#3B82F6', hoverColor: 'hover:shadow-blue-500/30' },
  ];

  constructor(private router: Router) { }

  /**
   * Navigate to products page filtered by this exact category
   */
  onSolutionClick(solution: SolutionCategory): void {
    this.router.navigate(['/products'], {
      queryParams: { category: solution.categoryFilter }
    });
  }
}
