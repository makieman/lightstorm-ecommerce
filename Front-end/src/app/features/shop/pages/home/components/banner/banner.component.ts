import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

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
      image: 'https://res.cloudinary.com/dh5hssddg/image/upload/v1773335233/465692343_987560030053704_5056447468006047452_n_dqqygv.jpg',
      alt: 'Solar installation Kenya'
    },
    {
      image: 'https://res.cloudinary.com/dh5hssddg/image/upload/v1774120823/485167602_1086725036803869_8721182461128034495_n_abp5x4.jpg',
      alt: 'Solar panels installation'
    },
    {
      image: 'https://res.cloudinary.com/dh5hssddg/image/upload/v1774120819/619306649_1339528228190214_1471731446922929491_n_lcecza.jpg',
      alt: 'Solar energy system'
    },
    {
      image: 'https://res.cloudinary.com/dh5hssddg/image/upload/v1774120812/solar-power-power-station_zb1quw.jpg',
      alt: 'Solar power station'
    }
  ];

  currentSlide = 0;
  isTransitioning = false;
  private autoPlayInterval: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  nextSlide() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    setTimeout(() => { this.isTransitioning = false; }, 700);
  }

  prevSlide() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    setTimeout(() => { this.isTransitioning = false; }, 700);
  }

  goToSlide(index: number) {
    if (this.isTransitioning || index === this.currentSlide) return;
    this.isTransitioning = true;
    this.currentSlide = index;
    setTimeout(() => { this.isTransitioning = false; }, 700);
  }

  pauseAutoPlay() {
    this.stopAutoPlay();
  }

  resumeAutoPlay() {
    this.startAutoPlay();
  }
}
