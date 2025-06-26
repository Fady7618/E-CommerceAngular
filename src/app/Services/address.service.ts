import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  baseUrl = 'https://countriesnow.space/api/v0.1/';
  private addresses: any[] = []; // Mock addresses storage

  constructor(private Http: HttpClient) {
    // Load saved addresses from localStorage
    const savedAddresses = localStorage.getItem('user_addresses');
    if (savedAddresses) {
      this.addresses = JSON.parse(savedAddresses);
    }
  }

  private saveAddresses() {
    localStorage.setItem('user_addresses', JSON.stringify(this.addresses));
  }

  // Get all countries
  getCountry(): Observable<any> {
    return this.Http.get(`${this.baseUrl}countries`).pipe(
      map((response: any) => ({
        data: response.data.map((country: any, index: number) => ({
          id: index + 1,
          name: country.country,
          iso2: country.iso2,
          iso3: country.iso3
        }))
      }))
    );
  }

  // Get states/governorates by country name
  getGovernorates(countryName: any): Observable<any> {
    const payload = {
      country: countryName
    };
    
    return this.Http.post(`${this.baseUrl}countries/states`, payload).pipe(
      map((response: any) => ({
        data: response.data.states.map((state: any, index: number) => ({
          id: index + 1,
          name: state.name,
          state_code: state.state_code,
          country_name: countryName
        }))
      }))
    );
  }

  // Get cities by country and state name
  getCities(countryName: any, stateName: any = null): Observable<any> {
    if (stateName) {
      // Get cities by state
      const payload = {
        country: countryName,
        state: stateName
      };
      
      return this.Http.post(`${this.baseUrl}countries/state/cities`, payload).pipe(
        map((response: any) => ({
          data: response.data.map((city: string, index: number) => ({
            id: index + 1,
            name: city,
            state_name: stateName,
            country_name: countryName
          }))
        }))
      );
    } else {
      // Get all cities by country
      const payload = {
        country: countryName
      };
      
      return this.Http.post(`${this.baseUrl}countries/cities`, payload).pipe(
        map((response: any) => ({
          data: response.data.map((city: string, index: number) => ({
            id: index + 1,
            name: city,
            country_name: countryName
          }))
        }))
      );
    }
  }

  // Mock address management methods
  address(): Observable<any> {
    return of({
      data: this.addresses
    });
  }

  addAddress(obj: any): Observable<any> {
    const newAddress = {
      ...obj,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    
    this.addresses.push(newAddress);
    this.saveAddresses();
    
    return of({
      data: newAddress,
      message: 'Address added successfully'
    });
  }

  updateAddress(obj: any, id: any): Observable<any> {
    const index = this.addresses.findIndex(addr => addr.id == id);
    if (index !== -1) {
      this.addresses[index] = {
        ...obj,
        id: id,
        updated_at: new Date().toISOString()
      };
      this.saveAddresses();
    }
    
    return of({
      data: this.addresses[index],
      message: 'Address updated successfully'
    });
  }

  deleteAddress(id: any): Observable<any> {
    this.addresses = this.addresses.filter(addr => addr.id != id);
    this.saveAddresses();
    
    return of({
      message: 'Address deleted successfully'
    });
  }

  getSingleAddress(id: any): Observable<any> {
    const address = this.addresses.find(addr => addr.id == id);
    return of({
      data: address || null
    });
  }

  // Helper method to get country by name
  getCountryByName(countryName: string): Observable<any> {
    return this.Http.get(`${this.baseUrl}countries`).pipe(
      map((response: any) => {
        const country = response.data.find((country: any) => 
          country.country.toLowerCase() === countryName.toLowerCase()
        );
        return { data: country };
      })
    );
  }
}
