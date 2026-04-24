import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environments } from '../../environments/environment'
import { BehaviorSubject, from } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;
  private turnosSubject = new BehaviorSubject<any[]>([]);
  public turnos$ = this.turnosSubject.asObservable();
  private listening = false;

  constructor() {
    this.supabase = createClient(environments.supabaseUrl, environments.supabaseKey);

  }
  async crearTurno(nombre: string, servicio: string = 'General') {

    const { data: ultimoTurno } = await this.supabase
      .from('turnos')
      .select('numero_turno')
      .order('numero_turno', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nuevoNumero = ultimoTurno && ultimoTurno.numero_turno ? ultimoTurno.numero_turno + 1 : 1;


    const { data, error } = await this.supabase
    .from('turnos')
    .insert([{ nombre_cliente: nombre, estado: 'esperando', numero_turno: nuevoNumero }])
    .select()
    .single();
  
      
    

    if (error) {
      console.error('Error al registrar: razones nose jaja ', error);
      return null;
    }
    console.log('Turno registrado');
    return data;
  }

  async obtenerTurnos() {
    const { data, error } = await this.supabase
      .from('turnos')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error) {
      this.turnosSubject.next(data || []);
    }
  }


  escucharTurnos() {
    this.supabase
      .channel('turnos-en-vivo')
      .on(

        'postgres_changes',
        { event: '*', schema: 'public', table: 'turnos' },
        () => {
          console.log('Cambio detectado');
          this.obtenerTurnos();
        }
      )
      .subscribe();

  }

  initTurnos() {
    if (this.listening) return;
    this.listening = true;
    this.obtenerTurnos();
    this.escucharTurnos();
  }


  async siguienteTurno(sillaId: number) {

    await this.supabase
      .from('turnos')
      .update({ estado: 'finalizado' })
      .eq('estado', 'atendiendo')
      .eq('silla', sillaId);

    const { data: proximo } = await this.supabase
      .from('turnos')
      .select('*')
      .eq('estado', 'esperando')
      .order('numero_turno', { ascending: true })
      .limit(1)
      .single();


    if (proximo) {
      await this.supabase
        .from('turnos')
        .update({ estado: 'atendiendo', silla: sillaId })
        .eq('id', proximo.id);
    }


  }

  async reiniciarTurnos() {
    console.log("inicianlo limpiesa de datos...");
    const { data, error } = await this.supabase
      .from('turnos')
      .delete()
      .not('id', 'is', null);

    if (error) {
      console.log("Error al reiniciar", error.message)

    } else {
      console.log("Reinicio completo")
    }


  }


  async cancelarTurno(id: string) {
    const { error } = await this.supabase
      .from('turnos')
      .delete()
      .eq('id', id);

    if (error) {

      console.log("Error al cancelar rl turno", error.message);
    } else {
      console.log("Turno cancelado");


    }




  }


  async finalizarCorte(sillaId: number) {
    const { error } = await this.supabase
      .from('turnos')
      .update({ estado: 'finalizado' })
      .eq('estado', 'atendiendo')
      .eq('silla', sillaId);

    if (error) {
      console.log("Error al finalizar corte", error.message);
    } else {
      console.log(`Corte en silla ${sillaId} terminado`);
    }
  }






}