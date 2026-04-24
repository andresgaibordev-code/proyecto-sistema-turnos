import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SupabaseService } from 'src/app/services/supabase';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private supabaseService = inject(SupabaseService);
  siguientes$!: Observable<any[]>;
  private router = inject(Router);
  
  sillaSeleccionada: number = 0;
  sillasOcupadas: number[] = []; 

  // Modales
  mostrarConfirmacion: boolean = false;
  mostrarErrorSilla: boolean = false; 
  turnoAProcesar: any = null;

  ngOnInit() {
    this.supabaseService.initTurnos();

   
    this.siguientes$ = this.supabaseService.turnos$.pipe(
      map(turnos => turnos.filter(t => t.estado === 'esperando'))
    );

    
    this.supabaseService.turnos$.subscribe(turnos => {
      this.sillasOcupadas = turnos
        .filter(t => t.estado === 'atendiendo' && t.silla)
        .map(t => t.silla);
    });
  }

 
  seleccionarSilla(i: number) {
 
    if (this.sillasOcupadas.includes(i) && this.sillaSeleccionada !== i) {
      this.mostrarErrorSilla = true; 
    }
    this.sillaSeleccionada = i;
  }


  confirmarLlamada(turno: any) {
    if (this.sillaSeleccionada === 0) {
      alert("¡Primero selecciona en qué silla estás trabajando arriba!");
      return;
    }
    this.turnoAProcesar = turno;
    this.mostrarConfirmacion = true;
  }

 
  async ejecutarLlamado() {
    await this.supabaseService.siguienteTurno(this.sillaSeleccionada);
    this.mostrarConfirmacion = false;
    this.turnoAProcesar = null;
  }

  
  async terminarCorteActual() {
    if (this.sillaSeleccionada === 0) return;
    if (confirm(`¿Seguro que quieres liberar la SILLA ${this.sillaSeleccionada}?`)) {
      await this.supabaseService.finalizarCorte(this.sillaSeleccionada);
      this.sillaSeleccionada = 0; // Deselecciona la silla automáticamente
    }
  }


  async confirmarCancelacion(turno: any) {
    if (confirm(`¿Esta seguro que quiere cancelar el turno #${turno.numero_turno}?`)) {
      await this.supabaseService.cancelarTurno(turno.id);
    }
  }

  async confirmarReinicio() {
    if (confirm('¡ADVERTENCIA! ¿Desea reiniciar el sistema?')) {
      await this.supabaseService.reiniciarTurnos();
    }
  }

cerrarSesion(){

localStorage.removeItem('barberia_session');
this.router.navigate(['/login'])


}




}