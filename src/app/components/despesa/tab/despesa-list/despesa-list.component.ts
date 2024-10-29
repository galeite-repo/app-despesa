import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Despesa, DespesasService } from '../../../service/despesas.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeleteComponent } from '../../delete/delete.component';
import { ModalService } from '../../../../shared/services/modal.service';
import { Alert } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-despesa-list',
  templateUrl: './despesa-list.component.html',
  standalone: true,
  imports: [NgIf, FormsModule, NgFor, CommonModule],
  styleUrls: ['./despesa-list.component.scss']
})
export class DespesaListComponent implements OnInit {
  @Input() despesas: Despesa[] = [];
  @Input() toggleEye: boolean = false;
  @Output() onEdit = new EventEmitter<Despesa>();
  @Output() onDeleteItem = new EventEmitter<Alert>();

  despesaService = inject(DespesasService);
  private modalService = inject(ModalService);

  buscaDespesa: string = '';
  despesaSelected?: Despesa;

  constructor() { }

  ngOnInit() {
  }

  filtrarDespesa() {
    const term = this.buscaDespesa.toLowerCase();
    return this.despesas.filter(item => {
      const matchesDescricao = item.descricao.toLowerCase().includes(term);
      const matchesCategoria = item.categoria?.categoria.toLowerCase().includes(term);
      const matchesValor = item.valor.toString().includes(term);
      const matchesData = item.data === this.buscaDespesa;

      return matchesDescricao || matchesCategoria || matchesValor || matchesData;
    });
  }


  edit(despesa: Despesa) {
    this.onEdit.emit(despesa)
  }
  async deleteItem(item: Despesa) {
    try {
      await this.despesaService.delete(item.id)
      this.onDeleteItem.emit({ status: "Sucesso", mensagem: "Despesa Excluída" })
    } catch (error) {
      this.onDeleteItem.emit({ status: "Erro", mensagem: "Algo deu errado" })
      console.log(error)
    }
  }

  deleteModal(despesa: Despesa): void {
    this.modalService.openModal({
      component: DeleteComponent,
      inputs: {
        data: despesa,
        onDelete: async (despesa: Despesa) => {
          this.deleteItem(despesa)
        }
      }
    });
  }

}
