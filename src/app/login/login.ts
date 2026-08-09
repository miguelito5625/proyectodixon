import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatCardModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  username = '';
  password = '';
  
  loading = signal(false);
  errorMessage = signal('');

  async onLogin() {
    this.errorMessage.set('');
    if (!this.username || !this.password) {
      this.errorMessage.set('Por favor ingresa usuario y contraseña');
      return;
    }

    this.loading.set(true);
    
    // Construct email from username for Supabase (as requested)
    const email = `${this.username}@dixon.com`;

    const { error } = await this.supabase.signIn(email, this.password);
    
    this.loading.set(false);

    if (error) {
      this.errorMessage.set('Usuario o contraseña incorrectos');
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
