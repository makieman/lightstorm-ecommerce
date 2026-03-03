import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

import { NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterModule, NgFor, NgClass],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit, OnDestroy {
  allTestimonials = [
    {
      name: 'Rosemary',
      role: '5kVA Solar System',
      initials: 'R',
      text: '"The installation was high-quality and I loved that I only paid after everything worked perfectly. I immediately ordered a second 3kVA system for my other house!"',
      dark: false
    },
    {
      name: 'Returning Client',
      role: 'Diani, Mombasa',
      initials: 'R',
      text: '"This is my second time working with Lightstorm. I came back as a returning customer and paid in advance because of the immense trust I have in their professional work."',
      dark: true
    },
    {
      name: 'Burnt Forest Client',
      role: 'Referral',
      initials: 'B',
      text: '"This was a referral and the job was commissioned and neatly done. Reliable solar that finally ends Kenya Power token stress. Thank you Maranga!"',
      dark: false
    },
    {
      name: 'Davis Oba',
      role: 'Customer',
      initials: 'D',
      text: '"Super service I can recommend you Maranga."',
      dark: false
    },
    {
      name: 'Nikobe Brian',
      role: 'Customer',
      initials: 'N',
      text: '"All I can say is Thank you Maranga."',
      dark: true
    }
  ];

  displayedTestimonials: any[] = [];
  currentIndex = 0;
  intervalId: any;
  animationClass = '';

  ngOnInit() {
    this.updateDisplay();
    // Switch every 5 seconds
    this.intervalId = setInterval(() => {
      this.cycleTestimonials();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  cycleTestimonials() {
    // Trigger fade out
    this.animationClass = 'opacity-0 scale-95';

    setTimeout(() => {
      // Update logic after fade out
      this.currentIndex = (this.currentIndex + 1) % this.allTestimonials.length;
      this.updateDisplay();

      // Trigger fade in
      this.animationClass = 'opacity-100 scale-100';
    }, 500); // 500ms duration for transition
  }

  updateDisplay() {
    this.displayedTestimonials = [];
    for (let i = 0; i < 3; i++) {
      // Wrap around array logic
      let index = (this.currentIndex + i) % this.allTestimonials.length;
      this.displayedTestimonials.push(this.allTestimonials[index]);
    }
  }
}
