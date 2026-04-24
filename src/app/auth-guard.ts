import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';



export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

const isAuthenticated = localStorage.getItem('barberia_session') === 'true';

if (isAuthenticated){
return true;
} else {
console.warn("Acceso denegado. Redirigiendo al login...");
router.navigate(['/login'])
return false;
}








};
