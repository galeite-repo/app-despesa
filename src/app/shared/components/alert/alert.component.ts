import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [NgIf],
  templateUrl: './alert.component.html'
})
export class AlertComponent implements OnInit {
  @Input() status: 'Sucesso' | 'Alerta' | 'Erro' = 'Sucesso'; // Status do alerta
  @Input() message: string = ''; // Mensagem do alerta
  show: boolean = false;

  get alertClass() {
    switch (this.status) {
      case 'Sucesso':
        return 'bg-green-100 border border-green-500 text-green-700';
      case 'Alerta':
        return 'bg-yellow-100 border border-yellow-500 text-yellow-700';
      case 'Erro':
        return 'bg-red-100 border border-red-500 text-red-700';
      default:
        return 'bg-green-100 border border-green-500 text-green-700';
    }
  }

  ngOnInit() {
    // O alerta não deve aparecer automaticamente
  }

  showAlert(status: 'Sucesso' | 'Alerta' | 'Erro', message: string) {
    this.status = status; // Atualiza o status do alerta
    this.message = message; // Atualiza a mensagem do alerta
    this.show = true; // Mostrar o alerta
    // Auto-destruir o alerta após 3 segundos
    setTimeout(() => {
      this.show = false;
    }, 3000);
  }
}