import { Component } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {GlobalService} from "../../Services/global.service";
import {Router} from "@angular/router";
import {AuthService} from "../../Services/auth.service";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private global : GlobalService, private router : Router , private auth : AuthService) {
  }

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  isSubmitted = false;

  successLogin: any = null;

  get userData() {
    return this.loginForm.controls
  }

  handleSubmit() {
    this.isSubmitted = true;
    if (this.loginForm.valid) {
      this.auth.login(this.loginForm.value).subscribe(res => {
        if (res.status == 'Success'){
          localStorage.setItem('user_token',res.data.token)
          localStorage.setItem('user_name',res.data.first_name)
          this.global.userName = res.data.first_name;
          this.global.is_login = true;
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
