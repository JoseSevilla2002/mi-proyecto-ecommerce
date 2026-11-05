import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9; min-height: 100vh;">
      <h2>🚀 Panel de Control - Replicación MySQL GTID</h2>
      
      <!-- FORMULARIO MASTER -->
      <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <h3 style="margin-top: 0;">1. Nodo MASTER (:3306) - Permite Escrituras</h3>
        <input [(ngModel)]="nuevoProducto.nombre" placeholder="Nombre producto" style="margin-right: 10px; padding: 6px;"/>
        <input [(ngModel)]="nuevoProducto.precio" type="number" placeholder="Precio" style="margin-right: 10px; padding: 6px;"/>
        <button (click)="guardarEnMaster()" style="background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">
          Insertar Registro en Master
        </button>
      </div>

      <!-- BOTONES DE PRUEBA READ_ONLY -->
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffeeba;">
        ⚠️ <b>Prueba de Seguridad (read_only):</b> Intenta forzar una escritura en las réplicas:
        <button (click)="probarEscrituraIlegal(3307)" style="margin-left: 10px; background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
          Forzar INSERT en Replica 1 (:3307)
        </button>
        <button (click)="probarEscrituraIlegal(3308)" style="margin-left: 10px; background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
          Forzar INSERT en Replica 2 (:3308)
        </button>
        <p *ngIf="mensajeError" style="color: #721c24; background: #f8d7da; padding: 8px; border-radius: 4px; margin-top: 8px; font-weight: bold;">
          {{ mensajeError }}
        </p>
      </div>

      <!-- TABLAS DE CADA NODO -->
      <div style="display: flex; gap: 15px;">
        <div *ngFor="let nodo of nodos" style="flex: 1; background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin-top:0;">{{ nodo.nombre }} (Puerto {{ nodo.puerto }})</h4>
          <button (click)="cargarDatos(nodo.puerto)" style="margin-bottom: 10px; cursor: pointer;">🔄 Actualizar Datos</button>
          <table border="1" style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: #eee;">
                <th>ID</th><th>Producto</th><th>Precio</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of productosPorNodo[nodo.puerto]">
                <td>{{ p.id }}</td><td>{{ p.nombre }}</td><td>\${{ p.precio }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  nuevoProducto = { nombre: '', precio: 0 };
  mensajeError = '';
  timer: any;
  nodos = [
    { nombre: 'MASTER', puerto: 3306 },
    { nombre: 'REPLICA 1', puerto: 3307 },
    { nombre: 'REPLICA 2', puerto: 3308 }
  ];
  productosPorNodo: { [key: number]: any[] } = { 3306: [], 3307: [], 3308: [] };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.actualizarTodos();
    // Consulta automática a los 3 nodos cada 2 segundos
    this.timer = setInterval(() => this.actualizarTodos(), 2000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  guardarEnMaster() {
    this.http.post('http://localhost:3000/api/master/productos', this.nuevoProducto).subscribe({
      next: () => {
        this.nuevoProducto = { nombre: '', precio: 0 };
        this.mensajeError = '';
        this.actualizarTodos();
      },
      error: (err) => {
        this.mensajeError = 'Error al conectar con MASTER: ' + (err.error?.message || err.message);
      }
    });
  }

  probarEscrituraIlegal(puerto: number) {
    this.http.post(`http://localhost:3000/api/replica/${puerto}/productos`, { nombre: 'Illegal', precio: 10 }).subscribe({
      next: () => {},
      error: (err) => {
        this.mensajeError = `Rechazado por Nodo ${puerto}: ${err.error?.message || 'Error de escritura (read_only activo)'}`;
      }
    });
  }

  cargarDatos(puerto: number) {
    this.http.get<any[]>(`http://localhost:3000/api/nodo/${puerto}/productos`).subscribe({
      next: (data) => {
        this.productosPorNodo[puerto] = data;
      },
      error: () => {
        this.productosPorNodo[puerto] = [];
      }
    });
  }

  actualizarTodos() {
    this.nodos.forEach(n => this.cargarDatos(n.puerto));
  }
}