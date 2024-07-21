import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from '../Services/login.service';
import { MaterialModule } from 'src/app/material.module';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-session-expired',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './session-expired.component.html',
  styleUrls: ['./session-expired.component.scss'],
})
export class SessionExpiredComponent {
  constructor(
    private loginService: LoginService,
    public dialogRef: MatDialogRef<SessionExpiredComponent>
  ) {}
  onOkClick() {
    this.dialogRef.close();
    this.loginService.logout();
  }
}
