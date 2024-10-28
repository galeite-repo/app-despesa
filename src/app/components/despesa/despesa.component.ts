import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { format, formatDate, getMonth, getYear, setMonth } from 'date-fns';
import { Datepicker, initFlowbite } from 'flowbite';
import { NavbarComponent } from "../layout/navbar/navbar.component";
import { Categoria, CategoriasService } from '../service/categoria.service';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { ModalService } from '../../shared/services/modal.service';
import { AddComponent } from './categoria/add/add.component';
import { AlertComponent } from "../../shared/components/alert/alert.component";
import { Despesa, DespesasService } from '../service/despesas.service';
import { InputMaskDirective } from '../../shared/directives/InputMaskDirective';
import { MoneyMaskDirective } from '../../shared/directives/MoneyMaskDirective';
import { ChartComponent } from './chart/chart.component';
import { DeleteComponent } from './delete/delete.component';
import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js'; // Importe o idioma desejado


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
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, NgFor, AlertComponent, ReactiveFormsModule, CommonModule, FormsModule, InputMaskDirective, MoneyMaskDirective],
  templateUrl: './despesa.component.html',
  styleUrl: './despesa.component.scss'
})
export class DespesaComponent implements OnInit, AfterViewInit {
  @ViewChild('datePicker') datePickerElement!: ElementRef;
  flatpickrInstance: flatpickr.Instance | undefined
  @ViewChild('dataInput') dataInput!: ElementRef;
  @ViewChild('descricaoInput') descricaoInput!: ElementRef;
  selectedDate!: string;

  @ViewChild(AlertComponent) alertComponent!: AlertComponent;
  private modalService = inject(ModalService);

  toggleEye: boolean = false;
  buscaDespesaFixa: string = '';
  buscaDespesaGeral: string = '';

  despesa!: Despesa;
  despesaSelected?: Despesa;
  categoriaService = inject(CategoriasService);
  categoriaList: Categoria[] = [];
  despesaService = inject(DespesasService);
  despesaList: Despesa[] = [];
  despesaFixa: Despesa[] = [];
  despesaGeral: Despesa[] = [];
  totalDespesa: number = 0;
  totalDespesaFixa: number = 0;
  totalFinal: number = 0;
  totalGeral: number = 0;

  mesSelecionado: any;
  anoSelecionado: any;

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

  ngAfterViewInit(): void {
    this.flatpickrInstance = flatpickr(this.datePickerElement.nativeElement, {
      dateFormat: 'd-m-Y',
      locale: Portuguese
    });
  }

  async ngOnInit() {
    this.selectedDate = '';
    const savedToggleEye = localStorage.getItem('toggleEye');
    if (savedToggleEye !== null) {
      this.toggleEye = JSON.parse(savedToggleEye);
    }

    this.mesSelecionado = getMonth(new Date()) + 1;
    this.anoSelecionado = getYear(new Date());
    await this.loadData(this.mesSelecionado, this.anoSelecionado);
    initFlowbite();

  }

  private focusOnDescricao() {
    setTimeout(() => {
      if (this.descricaoInput) {
        this.descricaoInput.nativeElement.focus();
      }
    }, 0);
  }

  toggleView() {
    this.toggleEye = !this.toggleEye;
    localStorage.setItem('toggleEye', JSON.stringify(this.toggleEye));

  }
  async onSelecionaMes(mes: any) {
    const inputElement = mes.target as HTMLInputElement;
    const value = inputElement.value;
    this.mesSelecionado = value
    await this.loadData(this.mesSelecionado, this.anoSelecionado);
  }

  filteredDespesaFixa() {
    const term = this.buscaDespesaFixa.toLowerCase();

    return this.despesaFixa.filter(item => {
      const matchesDescricao = item.descricao.toLowerCase().includes(term);
      const matchesCategoria = item.categoria?.categoria.toLowerCase().includes(term);
      const matchesValor = item.valor.toString().includes(term);
      const matchesData = item.data === this.buscaDespesaFixa;

      return matchesDescricao || matchesCategoria || matchesValor || matchesData;
    });
  }

  filteredDespesaGeral() {
    const term = this.buscaDespesaGeral.toLowerCase();

    return this.despesaList.filter(item => {
      const matchesDescricao = item.descricao.toLowerCase().includes(term);
      const matchesCategoria = item.categoria?.categoria.toLowerCase().includes(term);
      const matchesValor = item.valor.toString().includes(term);
      const matchesData = item.data === this.buscaDespesaFixa;

      return matchesDescricao || matchesCategoria || matchesValor || matchesData;
    });
  }



  formatDate(dateString: string): string {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  }
  formatDateBR(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }

  edit(despesa: Despesa) {
    this.despesaSelected = despesa;
    this.form.setValue({
      categoria: this.despesaSelected.categoria!,
      categoria_id: this.despesaSelected.categoria!.id,
      descricao: this.despesaSelected.descricao,
      data: this.formatDateBR(this.despesaSelected.data),
      recorrente: this.despesaSelected.recorrente,
      status: this.despesaSelected.status ?? false,
      valor: this.despesaSelected.valor
    })
    this.focusOnDescricao();
  }

  recorrenciaData(data: any) {
    const dataObj = new Date(data);
    dataObj.setMonth(dataObj.getMonth() + 1);
    const novaData = dataObj.toISOString().split('T')[0];
    return novaData
  }

  async add() {
    this.form.value.data = this.formatDate(this.form.value.data!);
    this.despesa = this.form.value as Despesa
    try {
      if (this.despesaSelected) {
        this.despesa.id = this.despesaSelected.id
        delete this.despesa.categoria
        await this.despesaService.update(this.despesa)
        this.alertComponent.showAlert("Alerta", "Despesa atualizada!");
        this.resetForm();
        this.despesaSelected = undefined;

      } else {
        if (!this.despesa.recorrente) {
          this.despesa.status = true
        }
        await this.despesaService.insert(this.despesa)
        this.alertComponent.showAlert("Sucesso", "Adicionado com sucesso!");
        this.resetForm();
      }
      if (this.despesa.recorrente && this.despesa.status) {
        const dataProximaDespesa = this.recorrenciaData(this.despesa.data)
        this.despesa.data = dataProximaDespesa
        this.despesa.recorrente_ref = parseInt(this.despesa.id)
        await this.despesaService.putRecorrencia(parseInt(this.despesa.id), this.despesa)
      }
    } catch (error) {
      this.alertComponent.showAlert("Erro", "Algo deu errado");

    }
    this.focusOnDescricao()
    await this.loadData(this.mesSelecionado, this.anoSelecionado);
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

  async deleteItem(item: Despesa) {
    try {
      await this.despesaService.delete(item.id)
      this.alertComponent.showAlert("Alerta", "Despesa foi excluída.")
      await this.loadData(this.mesSelecionado, this.anoSelecionado);
    } catch (error) {
      this.alertComponent.showAlert("Erro", "Algo deu errado");
    }
  }


  async loadData(mes: number, ano: number) {
    this.despesaList = [];
    this.despesaFixa = [];
    this.despesaGeral = [];
    this.totalDespesa = 0;
    this.totalDespesaFixa = 0;
    await this.categoriaService.getAll();
    await this.despesaService.getAllGeral(mes, ano);
    await this.despesaService.getAll(mes, ano);
    await this.despesaService.getAllFixas(mes, ano);
    this.categoriaList = this.categoriaService.categorias();
    this.despesaList = this.despesaService.despesas();
    this.despesaGeral = this.despesaService.despesasGeral();
    this.despesaFixa = this.despesaService.despesasFixas();
    this.despesaList.map((item) => {
      this.totalDespesa += item.valor
    })
    this.despesaFixa.map((item) => {
      this.totalDespesaFixa += item.valor
    })
    this.despesaGeral.map((item) => {
      this.totalGeral += item.valor
    })
    this.totalFinal = this.totalDespesa + this.totalDespesaFixa
  }


  openModalAdd(): void {
    this.modalService.openModal({
      component: AddComponent,
      inputs: {
        data: this.categoriaList,
        onCreate: async () => {
          this.alertComponent.showAlert("Sucesso", "Adicionado com sucesso!");
          await this.loadData(this.mesSelecionado, this.anoSelecionado);
        }
      }
    });
  }

  openChartModal(): void {
    this.modalService.openModal({
      component: ChartComponent,
      inputs: {
        data: this.despesaGeral,
        total: this.totalGeral
      }
    });
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
