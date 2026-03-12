import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

declare const bootstrap: any;

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent implements OnInit, OnDestroy {
  slides = [
    {
      image: 'assets/images/solar/hero.webp',
      title: 'CLEAN, RELIABLE & SUSTAINABLE',
      subtitle: 'Premium Solar Solutions for Homes & Businesses',
      buttonText: 'Explore Solutions'
    },
    {
      image: 'assets/images/solar/h1-bg.webp',
      title: 'HI-TECH WATER SOLUTIONS',
      subtitle: 'Reliable Borehole & Irrigation Systems',
      buttonText: 'View Water Solutions'
    }
  ];

  categories = [
    {
      name: 'Solar & Renewable Energy',
      slug: 'solar',
      items: ['Solar panels, inverters, batteries', 'Solar installation services']
    },
    {
      name: 'Borehole & Water Solutions',
      slug: 'water',
      items: ['Borehole drilling', 'Water pumps & tanks', 'Water system installation services']
    },
    {
      name: 'Electrical & Wiring',
      slug: 'electrical',
      items: ['Electrical installations', 'Electric fencing solutions']
    }
  ];

  private carouselInstance: any;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize Bootstrap carousel after view is rendered
      setTimeout(() => {
        const carouselElement = document.getElementById('heroCarousel');
        if (carouselElement && typeof bootstrap !== 'undefined') {
          this.carouselInstance = new bootstrap.Carousel(carouselElement, {
            interval: 5000,
            wrap: true,
            keyboard: true,
            pause: 'hover',
            ride: 'carousel'
          });
        }
      }, 100);

    }
  }

  ngOnDestroy() {
    if (this.carouselInstance) {
      this.carouselInstance.dispose();
    }
  }

}
