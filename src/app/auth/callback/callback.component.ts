import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get the authorization code from URL
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const error = params['error'];
      
      if (error) {
        this.error = 'Authentication failed: ' + error;
        this.isLoading = false;
        return;
      }
      
      if (!code) {
        this.error = 'No authorization code received';
        this.isLoading = false;
        return;
      }
      
      // Exchange code for tokens
      this.authService.googleAuth(code).subscribe({
        next: () => {
          Swal.fire({
            title: 'Success!',
            text: 'You have successfully logged in with Google.',
            icon: 'success',
            timer: 1200,
            showConfirmButton: false
          }).then(() => {
            window.location.href = '/'; // Reloads and routes to home
          });
        },
        error: (err) => {
          console.error('Google auth error:', err);
          this.error = 'Authentication failed. Please try again.';
          this.isLoading = false;
        }
      });
    });
  }
}
