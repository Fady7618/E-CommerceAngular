import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from "./pages/index/index.component";
import { SignupComponent } from "./auth/signup/signup.component";
import { LoginComponent } from "./auth/login/login.component";
import { ProfileComponent } from './user/profile/profile.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { SingleProductComponent } from './pages/single-product/single-product.component';
import { ProductsComponent } from './pages/products/products.component';
import { CartComponent } from './pages/cart/cart.component';
import { AddressComponent } from './user/address/address.component';
import { CreateAddressComponent } from './user/create-address/create-address.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { CallbackComponent } from './auth/callback/callback.component'; // Add this
import { AuthGuard } from './guards/auth.guard'; // Add this

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'auth/callback', component: CallbackComponent }, // Add this OAuth callback route
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] }, // Add guard
  { path: 'wishlist', component: WishlistComponent },
  { path: 'cart', component: CartComponent },
  { path: 'address', component: AddressComponent, canActivate: [AuthGuard] }, // Add guard
  { path: 'address/create', component: CreateAddressComponent, canActivate: [AuthGuard] }, // Add guard
  { path: 'address/update/:id', component: CreateAddressComponent, canActivate: [AuthGuard] }, // Add guard
  { path: 'products', component: ProductsComponent },
  { path: 'category/:name', component: ProductsComponent },
  { path: 'product/single/:id', component: SingleProductComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
