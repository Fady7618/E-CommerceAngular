import { Component } from '@angular/core';
import { GlobalService } from '../../Services/global.service';
import { AuthService } from '../../Services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  userData: any = '';
  userId: any;
  model = {
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  };
  passwordModel = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };
  constructor(private auth: AuthService, private router: Router) {
    this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.model.first_name = user.first_name || user.customer_first_name || '';
        this.model.last_name = user.last_name || user.customer_last_name || '';
        this.model.email = user.email || user.customer_email || '';
        this.model.phone = user.phone || user.customer_phone || '';
        this.userId = user._id || user.customer_id || '';
      }
    });
  }
  handleSubmit(registerForm: any) {
    if (registerForm.valid) {
      this.auth.updateProfile(this.model, this.userId).subscribe(
        (res) => {
          // Update localStorage with new user data
          const userData = {
            first_name: res.data.customer_first_name,
            last_name: res.data.customer_last_name,
            email: res.data.customer_email,
            phone: res.data.customer_phone
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('user_name', res.data.customer_first_name);
          this.auth.updateCurrentUser(userData);
          Swal.fire({
            title: 'Success!',
            text: 'Update Profile Successfully.',
            icon: 'success',
            timer: 1000,
            showConfirmButton: false
          });
        },
        (err) => {
          Swal.fire({
            title: 'Error!',
            text: 'Update Profile failed. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
    }
  }
  handlePasswordChange(passwordForm: any) {
    if (passwordForm.valid) {
      this.auth.changePassword(this.passwordModel).subscribe(
        (res) => {
          this.passwordModel.current_password = ''
          this.passwordModel.new_password = ''
          this.passwordModel.confirm_password = ''
          passwordForm.resetForm();
          Swal.fire({
            title: 'Success!',
            text: 'Change password Successfully.',
            icon: 'success',
            timer: 1000,
            showConfirmButton: false
          });
        },
        (err) => {
          Swal.fire({
            title: 'Error!',
            text: 'Change password failed. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
    }
  }

  validateNumberInput(event: any): boolean {
    const pattern = /^[0-9]$/;
    const inputChar = String.fromCharCode(event.charCode);
    
    // Allow special keys like backspace, delete, arrows, etc.
    if (event.charCode === 0) {
      return true;
    }
    
    // Only allow digit characters
    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return false;
    }
    
    return true;
  }
}
