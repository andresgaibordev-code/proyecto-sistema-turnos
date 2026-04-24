import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  password: string = '';
  error: boolean = false;
  private router = inject(Router);
  verClave: boolean = false;


  acceder() {
    if (this.password === 'barberia123') {

      localStorage.setItem('barberia_session', 'true');
      this.router.navigate(['/dashboard']);

    } else {
      this.error = true;
      setTimeout(() => this.error = false, 3000)


    }




  }




}
