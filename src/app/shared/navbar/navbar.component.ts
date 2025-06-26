import { Component } from '@angular/core';
import { GlobalService } from '../../Services/global.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'] // Corrected to 'styleUrls'
})
export class NavbarComponent {

  constructor(public global: GlobalService, private router : Router) {
  }

  logout(){
    this.global.userName = '';
    this.global.is_login = false;
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');
    Swal.fire({
      title: 'Success!',
      text: 'Logout Successfully.',
      icon: 'success',
      timer: 1000,
      showConfirmButton: false
    }).then(() => {
      this.router.navigateByUrl('/');
    });;
  }
}
