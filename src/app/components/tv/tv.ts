import { Component, HostListener, inject, OnInit} from '@angular/core';
import { CommonModule, WeekDay } from '@angular/common';
import { SupabaseService } from 'src/app/services/supabase';
import { map } from 'rxjs';
import { QRCodeComponent } from 'angularx-qrcode';
import  Hls  from 'hls.js';

@Component({
  selector: 'app-tv',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './tv.html',
  styleUrl: './tv.css',
})
export class Tv implements OnInit {
  private supabaseService = inject(SupabaseService);
  
  horaActual: string = '';
  fechaActual: string= '';
  
  turnoActual$ = this.supabaseService.turnos$.pipe (
    map(turnos => turnos.find(t => t.estado === 'atendiendo'))
  );

  turnosAtendiendo$ = this.supabaseService.turnos$.pipe(
    map(turnos => turnos.filter(t => t.estado === 'atendiendo'))
  );

  siguientes$ = this.supabaseService.turnos$.pipe(
    map(turnos => turnos.filter(t => t.estado === 'esperando').slice(0, 4))
  );

  public enlaceRegistro: string = 'http://192.168.1.53:4200/registro';

  audioDesbloqueado: boolean = false;
  idsEnSilla: number[] = [];

  hls!: Hls;
  video!: HTMLVideoElement;

  canales = [
    {
      nombre: 'Teleamazonas',
      url: 'https://teleamazonas-live.cdn.vustreams.com/live/fd4ab346-b4e3-4628-abf0-b5a1bc192428/live.isml/fd4ab346-b4e3-4628-abf0-b5a1bc192428.m3u8'
    }
  ];

 
  @HostListener('document:click')
  desbloquearAudioGlobal(){
    if (!this.audioDesbloqueado){
      this.audioDesbloqueado = true;
      console.log('¡Audio desbloqueado!');
      const audioVacio = new Audio ('public/ding.mp3');
      audioVacio.volume = 0;
      audioVacio.play().catch(() => {} );
    }
  }

  ngOnInit() {
    this.supabaseService.initTurnos();
    
   
    this.turnosAtendiendo$.subscribe(activos => {
      const nuevosIds = activos.map((t: any) => t.id);
      const hayNuevoLlamado = nuevosIds.some((id: any) => !this.idsEnSilla.includes(id));

      if (hayNuevoLlamado && this.idsEnSilla.length > 0){
        this.reproducirSonido();
      }
      
      this.idsEnSilla = nuevosIds;
    });
    
    
    setTimeout(() => {
      this.video = document.getElementById('video') as HTMLVideoElement;
      console.log('VIDEO', this.video);
      this.cargarCanal(this.canales[0].url);
    }, 1000);

    
    this.actualizarReloj();
    setInterval(() => this.actualizarReloj(), 1000);
  }

  actualizarReloj(){
    const ahora = new Date();
    this.horaActual = ahora.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    this.fechaActual = ahora.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short'});
  }

  obtenerClienteEnSilla(activos: any[], numeroSilla: number) {
    return activos.find(t => t.silla === numeroSilla);
  }

  cargarCanal(url: string){
    if (this.hls){
      this.hls.destroy();
    }

    if(Hls.isSupported()){
      this.hls = new Hls();
      this.hls.loadSource(url);
      this.hls.attachMedia(this.video);
    }else{
      this.video.src = url;
    }
  }

  reproducirSonido() {
    if (this.audioDesbloqueado){
      const audio= new Audio('public/ding.mp3');
      audio.volume = 1;
      audio.play().catch(e => console.log('El navegador bloqueó el audio', e ));
    }else{
      console.log('Falta hacer el primer clic en la pantalla');
    }
  }
}