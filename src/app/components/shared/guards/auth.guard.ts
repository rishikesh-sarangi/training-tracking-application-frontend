import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../Services/login.service';

export const authGuardAdmin: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  if (
    loginService.isLoggedIn() &&
    localStorage.getItem('loggedInSaveAdmin') === 'true'
  ) {
    return true;
  } else {
    router.navigate(['']);
    return false;
  }
};

// const loggedInSave = localStorage.getItem('loggedInSaveAdmin');
// const loggedInTemp = localStorage.getItem('loggedInTempAdmin');
// return loggedInSave == 'true' || loggedInTemp == 'true';

// if (loggedin == 'true') {
//   return true;
// }
// return false;
//};

export const authGuardTeacher: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  if (
    loginService.isLoggedIn() &&
    localStorage.getItem('loggedInSaveTeacher') === 'true'
  ) {
    return true;
  } else {
    router.navigate(['']);
    return false;
  }
};
