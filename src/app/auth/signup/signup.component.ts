import { Component } from '@angular/core';
import { Register } from '../../Interfaces/formRegister';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {GlobalService} from "../../Services/global.service";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  constructor(private global : GlobalService,private auth: AuthService, private router: Router) { }

  model: Register = {
    first_name: '',
    last_name: '',
    phone: '' ,
    email: '',
    password: '',
    confirm_password: '',
  }


  handleSubmit(registerForm: any) {
    if (registerForm.valid) {
      this.auth.register(this.model).subscribe(
        (res) => {
          localStorage.setItem('user_token', res.data.token);
          localStorage.setItem('user_name', res.data.first_name);
          this.global.userName = res.data.first_name;
          this.global.is_login = true;
          Swal.fire({
            title: 'Success!',
            text: 'You have successfully registered.',
            icon: 'success',
            timer: 1000,
            showConfirmButton: false
          }).then(() => {
            this.router.navigateByUrl('/');
          });
        },
        (err) => {
          Swal.fire({
            title: 'Error!',
            text: 'Registration failed. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
    }
  }



}
