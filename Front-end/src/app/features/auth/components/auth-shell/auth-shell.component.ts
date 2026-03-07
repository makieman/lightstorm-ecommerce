import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class AuthShellComponent {
  @Input() activeTab: 'login' | 'register' = 'login';
  @Input() heading = '';
  @Input() subheading = '';
}