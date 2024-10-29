import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { format, formatDate, getMonth, getYear, setMonth } from 'date-fns';
import { Datepicker, initFlowbite } from 'flowbite';
import { NavbarComponent } from "../layout/navbar/navbar.component";
import { Categoria, CategoriasService } from '../service/categoria.service';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { ModalService } from '../../shared/services/modal.service';
import { AddComponent } from './categoria/add/add.component';
import { Alert, AlertComponent } from "../../shared/components/alert/alert.component";
import { Despesa, DespesasService } from '../service/despesas.service';
import { InputMaskDirective } from '../../shared/directives/InputMaskDirective';
import { MoneyMaskDirective } from '../../shared/directives/MoneyMaskDirective';
import { ChartComponent } from './chart/chart.component';
import { DeleteComponent } from './delete/delete.component';
import { DespesaRecorrenteComponent } from "./tab/despesa-list/despesa-list.component";
import { DespesaFormComponent } from "./tab/despesa-form/despesa-form.component"; // Importe o idioma desejado




@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, NgFor, AlertComponent, ReactiveFormsModule, CommonModule, FormsModule, InputMaskDirective, MoneyMaskDirective, DespesaRecorrenteComponent, DespesaFormComponent],
  templateUrl: './despesa.component.html',
  styleUrl: './despesa.component.scss'
})
export class DespesaComponent implements OnInit {
  selectedDate!: string;

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
  despesaGeral: Despesa[] = [];
  totalDespesa: number = 0;
  totalDespesaFixa: number = 0;
  totalFinal: number = 0;
  totalGeral: number = 0;

  mesSelecionado: any;
  anoSelecionado: any;


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


  async onSubmitForm(msg: Alert) {
    this.alertComponent.showAlert(msg);
    await this.loadData(this.mesSelecionado, this.anoSelecionado);
    this.despesaSelected = undefined
  }

  onEditItem(despesa: Despesa) {
    this.despesaSelected = despesa;
  }

  async onDeleteItem(msg: Alert) {
    this.alertComponent.showAlert(msg);
    await this.loadData(this.mesSelecionado, this.anoSelecionado);
  }
  
  async onCreateCategoria(msg: Alert){
    this.alertComponent.showAlert(msg);
    await this.loadData(this.mesSelecionado, this.anoSelecionado);
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


  async loadData(mes: number, ano: number) {
    this.resetData();
  
    await this.loadCategorias();
    await this.loadDespesas(mes, ano);
  
    this.calculateTotals();
    this.calculateFinalTotal();
  }
  
  // Reseta os dados das listas e totais
  private resetData() {
    this.despesaList = [];
    this.despesaFixa = [];
    this.despesaGeral = [];
    this.totalDespesa = 0;
    this.totalDespesaFixa = 0;
    this.totalGeral = 0;
  }
  
  // Carrega as categorias
  private async loadCategorias() {
    await this.categoriaService.getAll();
    this.categoriaList = this.categoriaService.categorias();
  }
  
  // Carrega as despesas geral, fixa e total
  private async loadDespesas(mes: number, ano: number) {
    await Promise.all([
      this.despesaService.getAll(mes, ano),
      this.despesaService.getAllGeral(mes, ano),
      this.despesaService.getAllFixas(mes, ano),
    ]);
  
    this.despesaList = this.despesaService.despesas();
    this.despesaGeral = this.despesaService.despesasGeral();
    this.despesaFixa = this.despesaService.despesasFixas();
  }
  
  // Calcula os totais de cada lista de despesas
  private calculateTotals() {
    this.totalDespesa = this.calculateTotal(this.despesaList);
    this.totalDespesaFixa = this.calculateTotal(this.despesaFixa);
    this.totalGeral = this.calculateTotal(this.despesaGeral);
  }
  
  // Calcula o total final
  private calculateFinalTotal() {
    this.totalFinal = this.totalDespesa + this.totalDespesaFixa;
  }
  
  // Calcula o total de uma lista de despesas específica
  private calculateTotal(despesas: Array<{ valor: number }>): number {
    return despesas.reduce((total, item) => total + item.valor, 0);
  }
}
