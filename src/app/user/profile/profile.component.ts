import { Component, OnDestroy } from '@angular/core';
import { GlobalService } from '../../Services/global.service';
import { AuthService } from '../../Services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnDestroy {

  userData: any = '';
  userId: any;
  model = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    profile_image: ''
  };
  passwordModel = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };
  defaultImage = '/images/default-profile.jpg';
  userSubscription: Subscription;

  constructor(
    private auth: AuthService,
    private global: GlobalService,
    private router: Router
  ) {
    this.userSubscription = this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.model.first_name = user.first_name || user.customer_first_name || '';
        this.model.last_name = user.last_name || user.customer_last_name || '';
        this.model.email = user.email || user.customer_email || '';
        this.model.phone = user.phone || user.customer_phone || '';
        this.model.profile_image = user.profile_image || '';
        this.userId = user._id || user.customer_id || '';
      }
    });
  }

  handleSubmit(registerForm: any) {
    if (registerForm.valid) {
      this.auth.updateProfile(this.model, this.userId).subscribe(
        (res) => {
          // Fetch the updated user from the backend and update the app state
          this.auth.getProfile().subscribe(profileRes => {
            if (profileRes && profileRes.data) {
              this.auth.updateCurrentUser(profileRes.data);
            }
          });
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

    if (event.charCode === 0) {
      return true;
    }
    if (!pattern.test(inputChar)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  getProfileImage(): string {
    return this.model && this.model.profile_image
      ? this.model.profile_image
      : this.defaultImage;
  }

  handleImageError(event: any) {
    event.target.src = this.defaultImage;
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  deleteAccount() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete your account? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.auth.deleteAccount().subscribe(
          (res) => {
            Swal.fire({
              title: 'Deleted!',
              text: 'Your account has been deleted.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              this.auth.logout();
              this.router.navigate(['/']); // Redirect to home
            });
          },
          (err) => {
            Swal.fire('Error!', 'Failed to delete account.', 'error');
          }
        );
      }
    });
  }
}
