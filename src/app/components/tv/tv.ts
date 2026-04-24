import { Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
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


  audioDesbloqueado:boolean = false;
  idsEnSilla: number[] = [];

hls!: Hls;
video!: HTMLVideoElement;


canales = [

{
nombre: 'Teleamazonas',
url: 'https://teleamazonas-live.cdn.vustreams.com/live/fd4ab346-b4e3-4628-abf0-b5a1bc192428/live.isml/fd4ab346-b4e3-4628-abf0-b5a1bc192428.m3u8'

}
]

desbloquearAudio() {
    this.audioDesbloqueado = true;
    const audio = new Audio('assets/ding.mp3');
    audio.volume = 0; 
    audio.play().catch(e => console.log(e));
  }


  ngOnInit() {
    this.supabaseService.initTurnos();
    
    this.supabaseService.turnos$.subscribe(() => {
      const audio = new Audio('assets/ding.mp3');
      audio.play().catch(() => console.log('Audio esperando interacción'));
    });

this.turnosAtendiendo$.subscribe(activos => {
const nuevosIds = activos.map(t => t.id);
const hayNuevoLlamado = nuevosIds.some(id => !this.idsEnSilla.includes(id));

if (hayNuevoLlamado && this.audioDesbloqueado) {
        const audio = new Audio('ding.mp3');
        audio.play().catch(e => console.log('Audio bloqueado'));
      }

this.idsEnSilla = nuevosIds;
});





    setTimeout(() => {
  this.video = document.getElementById('video') as HTMLVideoElement;
  console.log('VIDEO', this.video);
  this.cargarCanal(this.canales[0].url);
}, 1000);

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
}