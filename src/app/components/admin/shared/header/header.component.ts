import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LoginService } from 'src/app/components/shared/Services/login.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(private router: Router, private loginService: LoginService) {}

  // course-programs toggle
  selectedTab: string = 'Courses';

  username: string | null = localStorage.getItem('username');

  protected logOut() {
    this.loginService.logout();
  }

  protected toggleCoursePrograms(selectedTabBool: boolean) {
    selectedTabBool
      ? (this.selectedTab = 'Courses')
      : (this.selectedTab = 'Programs');
  }
}
