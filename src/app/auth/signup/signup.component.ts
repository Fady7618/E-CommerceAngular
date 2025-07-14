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
  isLoading = false;

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
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  handleSubmit(registerForm: any) {
    if (registerForm.valid) {
      this.isLoading = true;
      this.auth.register(this.model).subscribe(
        (res) => {
          this.isLoading = false;
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
          
          // Initialize empty user data structures
          this.initializeEmptyUserData();
          
          // Use the global login method
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
          this.isLoading = false;
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

  // Add this new method to initialize empty user data
  private initializeEmptyUserData(): void {
    // Initialize empty cart
    localStorage.setItem('cart_items', JSON.stringify([]));
    
    // Initialize empty wishlist
    localStorage.setItem('wishlist_items', JSON.stringify([]));
    
    // Initialize empty addresses
    localStorage.setItem('user_addresses', JSON.stringify([]));
  }
  
  // Add this method for Google signup
  signupWithGoogle(): void {
    window.location.href = this.auth.getGoogleAuthUrl();
  }
}
