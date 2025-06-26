import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressService } from '../../Services/address.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-address',
  templateUrl: './create-address.component.html',
  styleUrls: ['./create-address.component.css']
})
export class CreateAddressComponent implements OnInit {
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  isEditMode = false;
  addressId: any = null;
  loading = false;

  model: any = {
    street_address: '',
    country_name: '',
    state_name: '',
    city_name: '',
    building_number: '',
    floor_number: '',
    flat_number: '',
    phone: '',
    postal_code: '',
    is_default: false
  };

  constructor(
    private addressService: AddressService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadCountries();
    
    // Check if editing existing address
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.addressId = params['id'];
        this.loadAddressForEdit();
      }
    });
  }

  loadCountries() {
    this.loading = true;
    this.addressService.getCountry().subscribe({
      next: (res) => {
        this.countries = res.data || [];
        this.loading = false;
        console.log('Countries loaded:', this.countries.length);
      },
      error: (err) => {
        console.error('Error loading countries:', err);
        this.loading = false;
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load countries. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  onCountryChange() {
    console.log('Country changed to:', this.model.country_name);
    this.states = [];
    this.cities = [];
    this.model.state_name = '';
    this.model.city_name = '';
    
    if (this.model.country_name) {
      this.loading = true;
      this.addressService.getGovernorates(this.model.country_name).subscribe({
        next: (res) => {
          this.states = res.data || [];
          this.loading = false;
          console.log('States loaded:', this.states.length);
        },
        error: (err) => {
          console.error('Error loading states:', err);
          this.loading = false;
          Swal.fire({
            title: 'Error!',
            text: 'Failed to load states. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });
    }
  }

  onStateChange() {
    console.log('State changed to:', this.model.state_name);
    this.cities = [];
    this.model.city_name = '';
    
    if (this.model.country_name && this.model.state_name) {
      this.loading = true;
      this.addressService.getCities(this.model.country_name, this.model.state_name).subscribe({
        next: (res) => {
          this.cities = res.data || [];
          this.loading = false;
          console.log('Cities loaded:', this.cities.length);
        },
        error: (err) => {
          console.error('Error loading cities:', err);
          this.loading = false;
          Swal.fire({
            title: 'Error!',
            text: 'Failed to load cities. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });
    }
  }

  loadAddressForEdit() {
    this.addressService.getSingleAddress(this.addressId).subscribe({
      next: (res) => {
        if (res.data) {
          this.model = { ...res.data };
          console.log('Address loaded for edit:', this.model);
          
          // Load states and cities based on saved country/state
          if (this.model.country_name) {
            // Wait for countries to load first
            setTimeout(() => {
              this.onCountryChange();
              if (this.model.state_name) {
                setTimeout(() => {
                  this.onStateChange();
                }, 1500); // Wait for states to load
              }
            }, 1000);
          }
        }
      },
      error: (err) => {
        console.error('Error loading address:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load address details.',
          icon: 'error',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/address']);
        });
      }
    });
  }

  handleSubmit(addressForm: any) {
    if (addressForm.valid) {
      this.loading = true;
      
      const operation = this.isEditMode 
        ? this.addressService.updateAddress(this.model, this.addressId)
        : this.addressService.addAddress(this.model);

      operation.subscribe({
        next: (res) => {
          this.loading = false;
          Swal.fire({
            title: 'Success!',
            text: res.message || `Address ${this.isEditMode ? 'updated' : 'added'} successfully.`,
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/address']);
          });
        },
        error: (err) => {
          this.loading = false;
          Swal.fire({
            title: 'Error!',
            text: `Failed to ${this.isEditMode ? 'update' : 'add'} address.`,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      Swal.fire({
        title: 'Invalid Form!',
        text: 'Please fill in all required fields.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }

  cancel() {
    this.router.navigate(['/address']);
  }
}