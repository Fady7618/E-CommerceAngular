import { Injectable } from '@angular/core';
import { 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../Services/auth.service';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    if (this.authService.isLoggedIn()) {
      return of(true);
    }
    // Try to fetch profile from backend
    return this.authService.getProfile().pipe(
      map(res => {
        if (res && res.data) {
          this.authService.updateCurrentUser(res.data);
          this.authService.isAuthenticated = true;
          return true;
        }
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return of(false);
      })
    );
  }
}