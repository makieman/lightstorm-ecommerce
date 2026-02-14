import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BannerComponent } from './components/banner/banner.component';
import { ProductComponent } from './components/product/product.component';

interface SolutionCategory {
  name: string;
  slug: string;
  icon: string;
  color: string;
  hoverColor: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    BannerComponent,
    ProductComponent,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  solutions: SolutionCategory[] = [
    { name: 'Solar Power', slug: 'solar', icon: 'bi-sun', color: '#84CC16', hoverColor: 'hover:shadow-green-500/30' },
    { name: 'Borehole', slug: 'borehole', icon: 'bi-droplet', color: '#3B82F6', hoverColor: 'hover:shadow-blue-500/30' },
    { name: 'Electrical', slug: 'electrical', icon: 'bi-lightning', color: '#F97316', hoverColor: 'hover:shadow-orange-500/30' },
    { name: 'Batteries', slug: 'battery', icon: 'bi-battery-charging', color: '#6366F1', hoverColor: 'hover:shadow-indigo-500/30' },
    { name: 'Inverters', slug: 'inverter', icon: 'bi-gear-wide-connected', color: '#14B8A6', hoverColor: 'hover:shadow-teal-500/30' },
    { name: 'Lighting', slug: 'solar-lighting', icon: 'bi-lightbulb', color: '#F43F5E', hoverColor: 'hover:shadow-rose-500/30' }
  ];

  constructor(private router: Router) {}

  /**
   * Navigate to products page with category filter
   */
  onSolutionClick(solution: SolutionCategory): void {
    // Navigate to products page with category and search params
    this.router.navigate(['/products'], {
      queryParams: { 
        category: solution.name,
        search: solution.name 
      }
    });
  }
}
