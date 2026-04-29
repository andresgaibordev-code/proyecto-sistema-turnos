import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, inject, OnInit} from '@angular/core';
import { CommonModule, WeekDay } from '@angular/common';
import { SupabaseService } from 'src/app/services/supabase';
import { every, map, share, shareReplay } from 'rxjs';
import { QRCodeComponent } from 'angularx-qrcode';
import  Hls  from 'hls.js';
import { distinctUntilChanged } from 'rxjs';
@Component({
  selector: 'app-tv',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './tv.html',
  styleUrl: './tv.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tv implements OnInit {
  private supabaseService = inject(SupabaseService);
  private cd = inject(ChangeDetectorRef);
  private turnosBase$ = this.supabaseService.turnos$.pipe(

    shareReplay(1)
  );
  horaActual: string = '';
  fechaActual: string= '';
  
  turnoActual$ = this.turnosBase$.pipe (
    map(turnos => turnos.find(t => t.estado === 'atendiendo')),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr) )
  );

  turnosAtendiendo$ = this.turnosBase$.pipe(
    map(turnos => turnos.filter(t => t.estado === 'atendiendo')),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
  );

  siguientes$ = this.turnosBase$.pipe(
    map(turnos => turnos.filter(t => t.estado === 'esperando').slice(0, 4)),
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
  );

  public enlaceRegistro: string = 'https://29043284.barberia-puembo.pages.dev/registro';

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
      const audioVacio = new Audio ('ding.mp3');
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
    setInterval(() => {
      this.actualizarReloj(); this.cd.markForCheck();
    }, 1000);
    
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
      this.hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
     manifestLoadingMaxRetry: 10,
       manifestLoadingRetryDelay: 1000,
      levelLoadingMaxRetry: 10,
      levelLoadingRetryDelay: 1000,
      fragLoadingMaxRetry: 10,
      fragLoadingRetryDelay: 1000,

       maxBufferLength: 15,
      maxMaxBufferLength: 30,
      });


     this.hls.on(Hls.Events.ERROR, (event, data) =>{

if(data.fatal){

switch(data.type){
case Hls.ErrorTypes.NETWORK_ERROR:
  console.log('Error de red- reintentado...');
  this.hls.startLoad();
  break;
  case Hls.ErrorTypes.MEDIA_ERROR:
    console.log('E  rror de media- recuperando...');
    this.hls.recoverMediaError();
break;

default:
  console.log('Error fatal - recargando canal... ');
  setTimeout(() => this.cargarCanal(url), 3000);


}


}



     }   );


      this.hls.loadSource(url);
      this.hls.attachMedia(this.video);





    }else{
      this.video.src = url;
    }
  }

  reproducirSonido() {
    if (this.audioDesbloqueado){
      const audio= new Audio('ding.mp3');
      audio.volume = 1;
      audio.play().catch(e => console.log('El navegador bloqueó el audio', e ));
    }else{
      console.log('Falta hacer el primer clic en la pantalla');
    }
  }
}