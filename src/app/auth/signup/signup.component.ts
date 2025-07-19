import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { GlobalService } from "../../Services/global.service";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  isLoading = false;

  // Patterns
  phonePattern = /^[0-9]{11}$/;
  passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

  passwordStrength = 0;
  passwordChecks = {
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  };
  passwordFocused = false;

  constructor(
    private global: GlobalService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z~ ]+$/)]],
      last_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z~ ]+$/)]],
      phone: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(this.passwordPattern)
      ]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  // Custom validator for password match
  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirm_password')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  get f() { return this.signupForm.controls; }

  handleSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      const model = this.signupForm.value;
      this.auth.register(model).subscribe(
        (res) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          localStorage.setItem('user_token', res.data.token);
          localStorage.setItem('user_name', res.data.first_name);
          const userData = {
            first_name: res.data.first_name,
            last_name: res.data.last_name,
            email: res.data.email,
            phone: res.data.phone
          };
          localStorage.setItem('user', JSON.stringify(userData));
          this.auth.updateCurrentUser(userData);
          this.initializeEmptyUserData();
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
          this.cdr.detectChanges();
          // Show the error message from backend or a generic message
          let errorMsg = 'Registration failed. Please try again.';
          if (err.error?.message) {
            errorMsg = err.error.message;
          } else if (err.message) {
            errorMsg = err.message;
          } else if (typeof err === 'string') {
            errorMsg = err;
          }
          Swal.fire({
            title: 'Error!',
            text: errorMsg,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
    } else {
      this.signupForm.markAllAsTouched();
    }
  }

  private initializeEmptyUserData(): void {
    localStorage.setItem('cart_items', JSON.stringify([]));
    localStorage.setItem('wishlist_items', JSON.stringify([]));
    localStorage.setItem('user_addresses', JSON.stringify([]));
  }

  signupWithGoogle(): void {
    window.location.href = this.auth.getGoogleAuthUrl();
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.signupForm.get('phone')?.setValue(input.value, { emitEvent: false });
  }

  onPasswordInput(): void {
    const value = this.signupForm.get('password')?.value || '';
    this.passwordChecks.length = value.length >= 8;
    this.passwordChecks.upper = /[A-Z]/.test(value);
    this.passwordChecks.lower = /[a-z]/.test(value);
    this.passwordChecks.number = /\d/.test(value);
    this.passwordChecks.special = /[~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    // Count how many checks are true
    this.passwordStrength = Object.values(this.passwordChecks).filter(Boolean).length;
  }

  getStrengthClass(): string {
    switch (this.passwordStrength) {
      case 5: return 'strong';
      case 4: return 'medium';
      case 3: return 'weak';
      default: return 'very-weak';
    }
  }
}
