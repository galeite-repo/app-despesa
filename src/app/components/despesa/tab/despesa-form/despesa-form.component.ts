import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Categoria } from '../../../service/categoria.service';
import { CommonModule } from '@angular/common';
import { InputMaskDirective } from '../../../../shared/directives/InputMaskDirective';
import { MoneyMaskDirective } from '../../../../shared/directives/MoneyMaskDirective';
import { Despesa, DespesasService } from '../../../service/despesas.service';
import { Alert } from '../../../../shared/components/alert/alert.component';
import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt';
import { AddComponent } from '../../categoria/add/add.component';
import { ModalService } from '../../../../shared/services/modal.service';

interface DespesaForm {
  recorrente?: FormControl<boolean | null>;
  status?: FormControl<boolean | null>;
  data?: FormControl<string | null>;
  valor?: FormControl<number | null>;
  descricao?: FormControl<string | null>;
  categoria?: FormControl<Categoria | null>;
  categoria_id?: FormControl<string | null>;
}

@Component({
  selector: 'app-despesa-form',
  templateUrl: './despesa-form.component.html',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, InputMaskDirective, MoneyMaskDirective],

  standalone: true,
  styleUrls: ['./despesa-form.component.scss']
})
export class DespesaFormComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() categoriaList: Categoria[] = []
  @Input() despesaSelected?: Despesa; // Tipo correto para despesa
  @Output() onComplete = new EventEmitter<Alert>();
  @Output() onCreateCategoria = new EventEmitter<Alert>();

  @ViewChild('descricaoInput') descricaoInput!: ElementRef;
  @ViewChild('datePicker') datePickerElement!: ElementRef;
  flatpickrInstance: flatpickr.Instance | undefined

  despesa!: Despesa;

  despesaService = inject(DespesasService);
  private modalService = inject(ModalService);
  private formBuilder = inject(FormBuilder);

  form = this.formBuilder.group<DespesaForm>({
    descricao: this.formBuilder.control(null, Validators.required),
    recorrente: this.formBuilder.control(false, Validators.required),
    status: this.formBuilder.control(false, Validators.required),
    categoria: this.formBuilder.control(null),
    categoria_id: this.formBuilder.control(null, Validators.required),
    data: this.formBuilder.control(null, Validators.required),
    valor: this.formBuilder.control(null, Validators.required),
  });


  constructor() { }

  ngOnChanges() {
    if (this.despesaSelected) {
      this.form.setValue({
        categoria: this.despesaSelected.categoria!,
        categoria_id: this.despesaSelected.categoria!.id,
        descricao: this.despesaSelected.descricao,
        data: this.formatDateBR(this.despesaSelected.data),
        recorrente: this.despesaSelected.recorrente,
        status: this.despesaSelected.status ?? false,
        valor: this.despesaSelected.valor
      })
    }
  }
  ngOnInit() {
  }
  ngAfterViewInit(): void {
    this.flatpickrInstance = flatpickr(this.datePickerElement.nativeElement, {
      dateFormat: 'd-m-Y',
      locale: Portuguese
    });
  }


  async onSubmit() {
    this.form.value.data = this.formatDate(this.form.value.data!);
    this.despesa = this.form.value as Despesa
    try {
      if (this.despesaSelected) {
        this.despesa.id = this.despesaSelected.id
        delete this.despesa.categoria
        await this.despesaService.update(this.despesa)
        this.onComplete.emit({ status: 'Alerta', mensagem: 'Despesa Atualizada!' });
      } else {
        if (!this.despesa.recorrente) {
          this.despesa.status = true
        }
        await this.despesaService.insert(this.despesa)
        this.onComplete.emit({ status: 'Sucesso', mensagem: 'Despesa Criada!' });
      }
      if (this.despesa.recorrente && this.despesa.status) {
        const dataProximaDespesa = this.recorrenciaData(this.despesa.data)
        this.despesa.data = dataProximaDespesa
        this.despesa.recorrente_ref = parseInt(this.despesa.id)
        await this.despesaService.putRecorrencia(parseInt(this.despesa.id), this.despesa)
      }
      this.resetForm()
    } catch (error) {
      this.onComplete.emit({ status: 'Erro', mensagem: 'Algo deu Errado' });
      console.log(error)
    }

    this.focusOnDescricao()
  }

  formatDate(dateString: string): string {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  }

  formatDateBR(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }

  resetForm(): void {
    this.form.reset({
      recorrente: false,
      categoria_id: null,
      categoria: null,
      data: null,
      descricao: null,
      status: false,
      valor: null
    });
    if (this.flatpickrInstance) {
      this.flatpickrInstance.clear();
    }
  }

  private focusOnDescricao() {
    setTimeout(() => {
      if (this.descricaoInput) {
        this.descricaoInput.nativeElement.focus();
      }
    }, 0);
  }

  recorrenciaData(data: any) {
    const dataObj = new Date(data);
    dataObj.setMonth(dataObj.getMonth() + 1);
    const novaData = dataObj.toISOString().split('T')[0];
    return novaData
  }

  openModalCategoria() {
    this.modalService.openModal({
      component: AddComponent,
      inputs: {
        data: this.categoriaList,
        onCreate: async (categoria: any) => {
          if (categoria.id) {
            this.onCreateCategoria.emit({ status: "Alerta", mensagem: "Categoria Atualizada!" })
          } else {
            this.onCreateCategoria.emit({ status: "Sucesso", mensagem: "Categoria criada!" })
          }
        }

      }
    });
  }
}
