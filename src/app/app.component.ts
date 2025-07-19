import { Component, OnInit } from '@angular/core';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'final-project';

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.getProfile().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.auth.updateCurrentUser(res.data);
          this.auth.isAuthenticated = true;
        }
      },
      error: () => {
        this.auth.updateCurrentUser(null);
        this.auth.isAuthenticated = false;
      }
    });
  }
}
