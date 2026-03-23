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
      image: 'https://res.cloudinary.com/dh5hssddg/image/upload/v1774274163/%CE%95%CF%85%CF%87%CE%B1%CF%81%CE%B9%CF%83%CF%84%CE%BF%CF%8D%CE%BC%CE%B5_%CF%80%CE%BF%CE%BB%CF%8D_%CE%B3%CE%B9%CE%B1_%CF%84%CE%B7%CE%BD_%CF%80%CF%81%CE%BF%CF%84%CE%AF%CE%BC%CE%B7%CF%83%CE%B7_%CF%83%CE%B1%CF%82_%CE%BA%CE%B1%CE%AF_%CF%84%CE%B7%CE%BD_%CE%B5%CE%BC%CF%80%CE%B9%CF%83%CF%84%CE%BF%CF%83%CF%8D%CE%BD%CE%B7_%CF%80%CE%BF%CF%85_%CE%BC%CE%B1%CF%82_%CE%B4%CE%B5%CE%AF%CF%87%CE%BD%CE%B5%CF%84%CE%B5____msolutiongreece_osmsecurity___security_securitysystem_security_system_homeprotection_shopprotection_homesecurity_shopsecurity_camera_adzwii.jpg',
      alt: 'cctv installation'
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
