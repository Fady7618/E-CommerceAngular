import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../../Services/global.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // Corrected to 'styleUrls'
})
export class NavbarComponent implements OnInit {
  user: any; // Define the user property

  constructor(
    public global: GlobalService,
    private router: Router,
    private auth: AuthService // Inject AuthService
  ) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(user => {
      this.user = user;
      // update UI accordingly
    });
  }

  logout() {
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');

    this.global.logout(); // Use the new method

    Swal.fire({
      title: 'Success!',
      text: 'Logout Successfully.',
      icon: 'success',
      timer: 1000,
      showConfirmButton: false
    }).then(() => {
      this.router.navigateByUrl('/');
    });
  }
}
