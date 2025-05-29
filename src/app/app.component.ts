import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Celda {
  fila: number;
  columna: number;
  es_mina: boolean;
  esta_revelada: boolean;
  esta_marcada: boolean;
  minas_vecinas: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  titulo = 'Buscaminas';
  filas = 10;
  columnas = 10;
  cantidad_minas = 10;
  tablero: Celda[][] = [];
  juego_terminado = false;
  victoria = false;
  banderas_colocadas = 0;
  primer_clic = true;

  ngOnInit(): void {
    this.nuevo_juego();
  }

  nuevo_juego(): void {
    this.juego_terminado = false;
    this.victoria = false;
    this.banderas_colocadas = 0;
    this.primer_clic = true;
    this.inicializar_tablero();
  }

  inicializar_tablero(): void {
    this.tablero = [];
    for (let f = 0; f < this.filas; f++) {
      const fila_actual: Celda[] = [];
      for (let c = 0; c < this.columnas; c++) {
        fila_actual.push({
          fila: f,
          columna: c,
          es_mina: false,
          esta_revelada: false,
          esta_marcada: false,
          minas_vecinas: 0,
        });
      }
      this.tablero.push(fila_actual);
    }
  }

  colocar_minas(celda_clickeada: Celda): void {
    let minas_por_colocar = this.cantidad_minas;
    while (minas_por_colocar > 0) {
      const f = Math.floor(Math.random() * this.filas);
      const c = Math.floor(Math.random() * this.columnas);
      if (!(f === celda_clickeada.fila && c === celda_clickeada.columna) && !this.tablero[f][c].es_mina) {
        this.tablero[f][c].es_mina = true;
        minas_por_colocar--;
      }
    }
  }

  calcular_minas_vecinas(): void {
    for (let f = 0; f < this.filas; f++) {
      for (let c = 0; c < this.columnas; c++) {
        if (!this.tablero[f][c].es_mina) {
          let contador = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (i === 0 && j === 0) continue;
              const fila_vecina = f + i;
              const columna_vecina = c + j;
              if (fila_vecina >= 0 && fila_vecina < this.filas &&
                  columna_vecina >= 0 && columna_vecina < this.columnas &&
                  this.tablero[fila_vecina][columna_vecina].es_mina) {
                contador++;
              }
            }
          }
          this.tablero[f][c].minas_vecinas = contador;
        }
      }
    }
  }

  revelar_celda(celda: Celda): void {
    if (this.juego_terminado || celda.esta_revelada || celda.esta_marcada) {
      return;
    }

    if (this.primer_clic) {
      this.colocar_minas(celda);
      this.calcular_minas_vecinas();
      this.primer_clic = false;
    }

    celda.esta_revelada = true;

    if (celda.es_mina) {
      this.juego_terminado = true;
      this.revelar_todas_las_minas();
      alert('PERDISTE');
      return;
    }

    if (celda.minas_vecinas === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const fila_vecina = celda.fila + i;
          const columna_vecina = celda.columna + j;
          if (fila_vecina >= 0 && fila_vecina < this.filas &&
              columna_vecina >= 0 && columna_vecina < this.columnas) {
            this.revelar_celda(this.tablero[fila_vecina][columna_vecina]);
          }
        }
      }
    }
    this.verificar_condicion_victoria();
  }

  alternar_bandera(evento: MouseEvent, celda: Celda): void {
    evento.preventDefault();
    if (this.juego_terminado || celda.esta_revelada) {
      return;
    }
    if (celda.esta_marcada) {
      celda.esta_marcada = false;
      this.banderas_colocadas--;
    } else {
      if (this.banderas_colocadas < this.cantidad_minas) {
        celda.esta_marcada = true;
        this.banderas_colocadas++;
      }
    }
  }

  revelar_todas_las_minas(): void {
    for (let f = 0; f < this.filas; f++) {
      for (let c = 0; c < this.columnas; c++) {
        if (this.tablero[f][c].es_mina) {
          this.tablero[f][c].esta_revelada = true;
        }
      }
    }
  }

  verificar_condicion_victoria(): void {
    let contador_reveladas = 0;
    for (let f = 0; f < this.filas; f++) {
      for (let c = 0; c < this.columnas; c++) {
        if (this.tablero[f][c].esta_revelada && !this.tablero[f][c].es_mina) {
          contador_reveladas++;
        }
      }
    }
    if (contador_reveladas === (this.filas * this.columnas - this.cantidad_minas)) {
      this.victoria = true;
      this.juego_terminado = true;
      this.revelar_todas_las_minas();
      alert('GANASTE');
    }
  }

  obtener_minas_restantes(): number {
    return this.cantidad_minas - this.banderas_colocadas;
  }
}
