import { Component, OnInit } from '@angular/core';
import { AddressService } from '../../Services/address.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css']
})
export class AddressComponent implements OnInit {
  addresses: any[] = [];
  loading = false;

  constructor(
    private addressService: AddressService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    this.loading = true;
    this.addressService.address().subscribe({
      next: (res) => {
        this.addresses = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading addresses:', err);
        this.loading = false;
      }
    });
  }

  deleteAddress(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.addressService.deleteAddress(id).subscribe({
          next: (res) => {
            Swal.fire('Deleted!', res.message, 'success');
            this.loadAddresses();
          },
          error: (err) => {
            Swal.fire('Error!', 'Failed to delete address.', 'error');
          }
        });
      }
    });
  }

  editAddress(id: any) {
    this.router.navigate(['/address/update', id]);
  }

  addNewAddress() {
    this.router.navigate(['/address/create']);
  }
}
