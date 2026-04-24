import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from 'src/app/services/supabase';
import { Router, NavigationEnd } from '@angular/router';
import { every, filter } from 'rxjs';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista.html',
  styleUrl: './lista.css',
})
export class Lista implements OnInit {
  private supabaseService = inject(SupabaseService);
  
  turnos$ = this.supabaseService.turnos$;

  ngOnInit() {
    
    this.supabaseService.initTurnos();
  }

trackById(index: number, item: any) {
  return item.id;
}


}



