import { CanActivateFn } from '@angular/router';

export const authGuardAdmin: CanActivateFn = (route, state) => {
  const loggedInSave = localStorage.getItem('loggedInSaveAdmin');
  const loggedInTemp = localStorage.getItem('loggedInTempAdmin');
  return loggedInSave == 'true' || loggedInTemp == 'true';

  // if (loggedin == 'true') {
  //   return true;
  // }
  // return false;
};

export const authGuardTeacher: CanActivateFn = (route, state) => {
  const loggedInSave = localStorage.getItem('loggedInSaveTeacher');
  const loggedInTemp = localStorage.getItem('loggedInTempTeacher');
  return loggedInSave == 'true' || loggedInTemp == 'true';
};
