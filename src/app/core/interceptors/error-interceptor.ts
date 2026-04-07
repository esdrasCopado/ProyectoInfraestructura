import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log("error", error);
      if (error.status === 0) {
        console.error('Could not connect to the server');
      } else if (error.status === 400) {
        console.error('Bad Request');
      } else if (error.status === 401) {
        console.error('Unauthorized');
      } else if (error.status === 403) {
        console.error('Forbidden');
      } else if (error.status === 404) {
        console.error('Not Found');
      } else if (error.status === 500) {
        console.error('Internal Server Error');
      }
      return throwError(() => error);
    })
  );
};