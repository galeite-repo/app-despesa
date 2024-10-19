import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { format, formatDate, getMonth, getYear, setMonth } from 'date-fns';
import { initFlowbite } from 'flowbite';
import { NavbarComponent } from "../layout/navbar/navbar.component";
import { Categoria, CategoriasService } from '../service/categoria.service';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { ModalService } from '../../shared/services/modal.service';
import { AddComponent } from './add/add.component';
import { AlertComponent } from "../../shared/components/alert/alert.component";
import { Despesa, DespesasService } from '../service/despesas.service';
import { InputMaskDirective } from '../../shared/directives/InputMaskDirective';
import { MoneyMaskDirective } from '../../shared/directives/MoneyMaskDirective';

interface DespesaForm {
  recorrente: FormControl<boolean | null>;
  data: FormControl<string | null>;
  valor: FormControl<number | null>;
  descricao: FormControl<string | null>;
  categoria: FormControl<Categoria | null>;
  categoria_id: FormControl<string | null>;
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, NgFor, AlertComponent, ReactiveFormsModule, CommonModule, FormsModule, InputMaskDirective, MoneyMaskDirective],
  templateUrl: './despesa.component.html',
  styleUrl: './despesa.component.scss'
})
export class DespesaComponent implements  OnInit {
  @ViewChild('dataInput') dataInput!: ElementRef; // Cria a referência

  @ViewChild(AlertComponent) alertComponent!: AlertComponent;
  private modalService = inject(ModalService);

  toggleEye: boolean = false;

  despesa!: Despesa;
  despesaSelected?: Despesa;
  categoriaService = inject(CategoriasService);
  categoriaList: Categoria[] = [];
  despesaService = inject(DespesasService);
  despesaList: Despesa[] = [];
  despesaFixa: Despesa[] = [];
  totalDespesa: number = 0;
  totalDespesaFixa: number = 0;
  totalFinal: number = 0;

  mesSelecionado: any;
  anoSelecionado: any;

  private formBuilder = inject(FormBuilder);
  form = this.formBuilder.group<DespesaForm>({
    descricao: this.formBuilder.control(null, Validators.required),
    recorrente: this.formBuilder.control(false, Validators.required),
    categoria: this.formBuilder.control(null),
    categoria_id: this.formBuilder.control(null, Validators.required),
    data: this.formBuilder.control(null, Validators.required),
    valor: this.formBuilder.control(null, Validators.required),
  });


  async ngOnInit() {
    const savedToggleEye = localStorage.getItem('toggleEye');
    if (savedToggleEye !== null) {
      this.toggleEye = JSON.parse(savedToggleEye);
    }

    this.mesSelecionado = getMonth(new Date()) + 1;
    this.anoSelecionado = getYear(new Date());
    await this.loadData(this.mesSelecionado, this.anoSelecionado);
    initFlowbite();
    this.focusOnInput();

  }
  private focusOnInput() {
    // Usando setTimeout para garantir que o elemento esteja renderizado
    setTimeout(() => {
      if (this.dataInput) {
        this.dataInput.nativeElement.focus();
      }
    }, 0); // O atraso pode ser 0 para que seja executado no próximo ciclo de eventos
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
      valor: this.despesaSelected.valor
    })
    console.log(this.form.value)
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
        await this.despesaService.insert(this.despesa)
        this.alertComponent.showAlert("Sucesso", "Adicionado com sucesso!");
        this.resetForm();
      }
    } catch (error) {
      this.alertComponent.showAlert("Erro", "Algo deu errado");

    }
    await this.loadData(this.mesSelecionado, this.anoSelecionado);
  }

  resetForm(): void {
    this.form.reset({
      recorrente: false,
      categoria_id: null,
      categoria: null,
      data: null,
      descricao: null,
      valor: null
    });
    this.focusOnInput()
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
    this.totalDespesa = 0;
    this.totalDespesaFixa = 0;
    await this.categoriaService.getAll();
    await this.despesaService.getAll(mes, ano);
    await this.despesaService.getAllFixas(mes, ano);
    this.categoriaList = this.categoriaService.categorias();
    this.despesaList = this.despesaService.despesas();
    this.despesaFixa = this.despesaService.despesasFixas();
    this.despesaList.map((item) => {
      this.totalDespesa += item.valor
    })
    this.despesaFixa.map((item) => {
      this.totalDespesaFixa += item.valor
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

}
