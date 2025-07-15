import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { GlobalService } from "../../Services/global.service";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../Services/auth.service";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(
    private global: GlobalService, 
    private router: Router, 
    private auth: AuthService,
    private route: ActivatedRoute
  ) {}

  // Update the validation rules
  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required, 
      Validators.email,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]),
    password: new FormControl('', [
      Validators.required, 
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/)
    ])
  });

  isSubmitted = false;
  successLogin: any = null;
  returnUrl: string = '/';
  isLoading = false;

  get userData() {
    return this.loginForm.controls;
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Redirect if already logged in
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  handleSubmit() {
    this.isSubmitted = true;
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.auth.login(this.loginForm.value).subscribe(
        (res) => {
          this.isLoading = false;
          if (res && res.data && res.data.token) {
            localStorage.setItem('user_token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            this.auth.updateCurrentUser(res.data);
            this.global.login(res.data.first_name);

            // Show Swal success alert and route to home
            Swal.fire({
              title: 'Success!',
              text: 'You have successfully logged in.',
              icon: 'success',
              timer: 1000,
              showConfirmButton: false
            }).then(() => {
              this.router.navigateByUrl('/');
            });
          }
        },
        (err) => {
          this.isLoading = false;
          let message = err.error?.message || 'Login failed. Please try again.';
          if (message === 'Please log in with Google') {
            message = 'This account was created with Google. Please use Google login.';
          }
          Swal.fire({
            title: 'Error!',
            text: message,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
    }
  }

  // Add this new method for Google login
  loginWithGoogle(): void {
    window.location.href = this.auth.getGoogleAuthUrl();
  }
}
