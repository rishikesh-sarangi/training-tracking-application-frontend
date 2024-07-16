import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'training-tracking-application';

  constructor(private router: Router) {}

  // keep me signed in logic
  // @HostListener('window:beforeunload', ['$event'])
  // protected onWindowClose(event: any) {
  //   localStorage.getItem('loggedInSave') == 'false' ||
  //   localStorage.getItem('loggedInTemp') == 'true'
  //     ? localStorage.clear()
  //     : '';
  // }
}
