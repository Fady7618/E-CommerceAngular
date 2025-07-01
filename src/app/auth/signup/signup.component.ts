import { Component } from '@angular/core';
import { Register } from '../../Interfaces/formRegister';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { GlobalService } from "../../Services/global.service";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  constructor(private global: GlobalService, private auth: AuthService, private router: Router) { }

  // Define validation patterns
  phonePattern = "[0-9]{11}";
  passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d\\W]{8,}$";

  model: Register = {
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: '',
  }

  // Add this method to validate digits only
  validateNumberInput(event: any): boolean {
    const pattern = /^[0-9]$/;
    const inputChar = String.fromCharCode(event.charCode);
    
    // Allow special keys like backspace, delete, arrows, etc.
    if (event.charCode === 0) {
      return true;
    }
    
    // Only allow digit characters
    if (!pattern.test(inputChar)) {
      // Invalid character, prevent it from being entered
      event.preventDefault();
      return false;
    }
    
    // Check length to prevent more than 11 digits
    if (event.target.value.length >= 11 && event.key !== 'Backspace') {
      event.preventDefault();
      return false;
    }
    
    return true;
  }

  handleSubmit(registerForm: any) {
    if (registerForm.valid) {
      this.auth.register(this.model).subscribe(
        (res) => {
          localStorage.setItem('user_token', res.data.token);
          localStorage.setItem('user_name', res.data.first_name);
          
          // Use the new login method
          this.global.login(res.data.first_name);
          
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
            text: err.error?.message || 'Registration failed. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
    }
  }
}
