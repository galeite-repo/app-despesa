import { Component, Inject, OnInit, Optional } from '@angular/core';
import { ModalService } from '../../../shared/services/modal.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Despesa } from '../../service/despesas.service';
import { CommonModule, NgIf } from '@angular/common';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  legend: ApexLegend;
  grid: ApexGrid;
  fill: ApexFill;
  tooltip: ApexTooltip;
};
interface CategoriaTotais {
  categoria: string;
  total: number;
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [NgApexchartsModule, NgIf, CommonModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent implements OnInit {
  public categoryChartOptions: any;
  showData: boolean=  true;
  constructor(
    private modalService: ModalService,
    @Inject("data") public data: any,
    @Inject("total") public total: any,
    @Optional() @Inject('onCreate') public onCreate: () => void = () => { },
  ) { }

  ngOnInit(): void {
    if(this.data.length <=0){
      this.showData = false
    }else{
      this.showData = true
      this.createCategoryChart()
    }

  }

  createCategoryChart() {
    const categoryTotals = this.getExpensesByCategory();
    this.categoryChartOptions = {
      
      series: [{
        data: Object.values(categoryTotals),
      }],
      chart: {
        type: 'bar',
        height: 350,
      },
      plotOptions: {
        bar: {
          horizontal: true
        }
      },

      xaxis: {
        categories: Object.keys(categoryTotals),
        labels: {
          style: {
            colors: '#FFF',  
            fontSize: '14px',  
            fontWeight: 400,
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#FFF',  
            fontSize: '14px',  
            fontWeight: 400,
          },
        },
      },

    };
  }
  

  getExpensesByCategory() {
    const totals = this.data.reduce((acc: any, despesa: Despesa) => {
      const categoryName = despesa.categoria?.categoria;  // Acessa a categoria aninhada
  
      if (!acc[categoryName!]) {
        acc[categoryName!] = 0;
      }
      
      // Atualiza o valor com 2 casas decimais
      acc[categoryName!] += despesa.valor;
      acc[categoryName!] = parseFloat(acc[categoryName!].toFixed(2));  // Garante que o valor tenha 2 casas decimais
  
      return acc;
    }, {});
  
    return totals;
  }

  closeModal(): void {
    this.modalService.closeModal();
  }
}
