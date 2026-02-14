import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

declare const bootstrap: any;

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
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
  private scrollListener: any;

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

      // Initialize parallax effect
      this.initParallax();
    }
  }

  ngOnDestroy() {
    if (this.carouselInstance) {
      this.carouselInstance.dispose();
    }
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  private initParallax() {
    this.scrollListener = () => {
      const scrolled = window.scrollY;
      const parallaxElements = document.querySelectorAll('.parallax-bg');
      parallaxElements.forEach((el) => {
        const element = el as HTMLElement;
        const speed = 0.3;
        element.style.transform = `translateY(${scrolled * speed}px)`;
      });
    };
    window.addEventListener('scroll', this.scrollListener);
  }
}
