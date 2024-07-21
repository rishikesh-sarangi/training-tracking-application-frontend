import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginService } from '../Services/login.service';
import { MatDialog } from '@angular/material/dialog';
import { SessionExpiredComponent } from '../session-expired/session-expired.component';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private loginService: LoginService, private dialog: MatDialog) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const jwttoken = this.loginService.getToken();
    if (jwttoken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${jwttoken}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token has expired
          this.loginService.logout();
          this.showSessionExpiredDialog();
        }
        return throwError(() => error);
      })
    );
  }

  private showSessionExpiredDialog(): void {
    this.dialog.open(SessionExpiredComponent, {
      width: '300px',
      disableClose: true,
    });
  }
}
