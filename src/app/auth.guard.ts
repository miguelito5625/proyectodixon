import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from './supabase.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  // We await the session directly from the client to be sure it's up to date
  const { data: { session } } = await supabaseService.client.auth.getSession();

  if (session) {
    return true;
  }

  // Redirect to the login page if the user is not authenticated
  return router.createUrlTree(['/login']);
};
