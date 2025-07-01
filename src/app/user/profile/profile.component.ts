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
  constructor(private global: GlobalService, private auth: AuthService, private router: Router) {
    // Fix method name from getPrfile to getProfile
    auth.getProfile().subscribe(res => {
      this.model.first_name = res.data.customer_first_name;
      this.model.last_name = res.data.customer_last_name;
      this.model.email = res.data.customer_email;
      this.model.phone = res.data.customer_phone;
      this.userId = res.data.customer_id;
    }, (err) => {
      router.navigateByUrl('/');
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
