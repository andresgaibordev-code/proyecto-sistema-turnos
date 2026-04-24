import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SupabaseService } from './services/supabase';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  



}
