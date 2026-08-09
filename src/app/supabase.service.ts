import { Injectable, signal, NgZone } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  public session = signal<Session | null>(null);

  constructor(private ngZone: NgZone) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // Ensure session state is updated within Angular zone to trigger CD
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.ngZone.run(() => {
        this.session.set(session);
      });
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.ngZone.run(() => {
        this.session.set(session);
      });
    });
  }

  get client() {
    return this.supabase;
  }

  async signIn(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({
      email: email,
      password: pass
    });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }
}
