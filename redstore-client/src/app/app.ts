import { Component, OnInit, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // 👈 Import HttpClient

// This prevents TypeScript from complaining that 'google' doesn't exist
declare const google: any;

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html' // Pointing to app.html in the same folder
})
export class AppComponent implements OnInit {

  // 👈 Inject HttpClient here
  constructor(private ngZone: NgZone, private http: HttpClient) {}

  ngOnInit(): void {
    const interval = setInterval(() => {
      if (typeof google !== 'undefined') {
        clearInterval(interval);
        this.initializeGoogleSignIn();
      }
    }, 100);
  }

  initializeGoogleSignIn() {
    google.accounts.id.initialize({
      client_id: '854136327852-v48sbh7hbb3145dmaq0kjt6aknpv6oms.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { theme: 'outline', size: 'large' }
    );
  }

  handleCredentialResponse(response: any) {
    this.ngZone.run(() => {
      const idToken = response.credential;
      console.log("TOKEN CAPTURED:", idToken);

      // 🚀 NEW: Send the token to your Spring Boot backend!
      this.http.post('https://redstore.zeroop.dev/api/users/google', { token: idToken })
        .subscribe({
          next: (res: any) => {
            console.log("Backend Response:", res);
            alert(`Logged in successfully as: ${res.email}`);
          },
          error: (err) => {
            console.error("Failed to hit backend:", err);
          }
        });
    });
  }
}
