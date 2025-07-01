import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { GlobalService } from "../../Services/global.service";
import { Router } from "@angular/router";
import { AuthService } from "../../Services/auth.service";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private global: GlobalService, private router: Router, private auth: AuthService) {}

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

  get userData() {
    return this.loginForm.controls;
  }

  handleSubmit() {
    this.isSubmitted = true;
    if (this.loginForm.valid) {
      this.auth.login(this.loginForm.value).subscribe(res => {
        if (res.status == 'Success') {
          // Store token and name for authentication
          localStorage.setItem('user_token', res.data.token);
          localStorage.setItem('user_name', res.data.first_name);
          
          // Store complete user data
          const userData = {
            first_name: res.data.first_name,
            last_name: res.data.last_name,
            email: res.data.email,
            phone: res.data.phone
          };
          
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Use the global login method
          this.global.login(res.data.first_name);
          
          Swal.fire({
            title: 'Success!',
            text: 'Login Successfully.',
            icon: 'success',
            timer: 1000,
            showConfirmButton: false
          }).then(() => {
            this.router.navigateByUrl('/');
          });
        }
      }, (err) => {
        Swal.fire({
          title: 'Error!',
          text: err.error.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
    }
  }
}
