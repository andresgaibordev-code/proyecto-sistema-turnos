import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from 'src/app/services/supabase';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private cdr = inject(ChangeDetectorRef);
  private supabaseService = inject(SupabaseService);
 

  nombreCliente: string = '';
  turnoAsignado: any = null;
  mostrarTicket: boolean = false;
  cargando: boolean = false;
  mensajeExito: string | null = null;

  
  async solicitarTurno() {
    if (!this.nombreCliente.trim()) {
      alert('Por favor, escribe tu nombre');
      return;
    }

    this.cargando = true;
    this.mensajeExito = null;
    this.cdr.detectChanges();

    try{
   
    const nuevoTurno = await this.supabaseService.crearTurno(this.nombreCliente);
    
  

    if (nuevoTurno) {
      this.turnoAsignado = nuevoTurno;
      this.mensajeExito = "¡Turno registrado correctamente Bienvenido.! ";
      this.mostrarTicket = true;
      this.nombreCliente = ''; 

      this.cdr.detectChanges();


      setTimeout(() => {this.mensajeExito = null; this.cdr.detectChanges();}, 5000); 
    } else {

     alert ("No se pudo obtener el turno. Intenta de nuevo")
      
    }
  }catch (error) {
    console.error("Error crítico en el registro:", error);
    alert("Error de conexión con el servidor.");
  } finally {
    this.cargando = false; 
    this.cdr.detectChanges();
  }
  }

cerrarTicket() {
  this.mostrarTicket = false;
  this.mensajeExito = null; 
  this.turnoAsignado = null;
  this.cdr.detectChanges();
}
}

