import { Component, OnInit } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, ApexPlotOptions, ApexYAxis, ApexLegend, ApexGrid, ApexFill, ApexTooltip, NgApexchartsModule } from 'ng-apexcharts';
import { Despesa } from '../../service/despesas.service';

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
  selector: 'app-bar-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {
 
  // Chart Options
  public categoryChartOptions: any;
  public periodChartOptions: any;
  public recurrentChartOptions: any;

  // Mock JSON de Despesas
  expenses = [
    { date: '2024-10-01', description: 'Aluguel', value: 1000, category: 'Pessoal 💸', recurring: true },
    { date: '2024-10-01', description: 'Aluguel', value: 1000, category: 'Pessoal 1💸', recurring: true },
    { date: '2024-10-01', description: 'Aluguel', value: 1000, category: 'Pessoal 2💸', recurring: true },
    { date: '2024-10-01', description: 'Aluguel', value: 1000, category: 'Pessoal 5💸', recurring: true },
    { date: '2024-10-02', description: 'Gasolina', value: 150, category: 'Carro 🚗', recurring: false },
    { date: '2024-10-02', description: 'Gasolina', value: 150, category: 'Carro5 🚗', recurring: false },
    { date: '2024-10-03', description: 'Supermercado', value: 250, category: 'Alimentação 🍔', recurring: true },
    { date: '2024-10-03', description: 'Supermercado', value: 250, category: 'Alimentação 🍔', recurring: true },
    { date: '2024-10-03', description: 'Supermercado', value: 250, category: 'Alimentação 🍔', recurring: true },
    { date: '2024-10-03', description: 'Supermercado', value: 250, category: 'Alimentação 2🍔', recurring: true },
    { date: '2024-10-03', description: 'Supermercado', value: 250, category: 'Alimentação1 🍔', recurring: true },
    { date: '2024-10-05', description: 'Cinema', value: 50, category: 'Lazer 🎉', recurring: false },
    { date: '2024-10-05', description: 'Cinema', value: 50, category: 'Lazer 1🎉', recurring: false },
    { date: '2024-10-05', description: 'Cinema', value: 50, category: 'Lazer 2🎉', recurring: false },
    { date: '2024-10-05', description: 'Cinema', value: 50, category: 'Lazer 6🎉', recurring: false },
    { date: '2024-10-05', description: 'Cinema', value: 50, category: 'Lazer 5🎉', recurring: false },
    // Adicione mais dados conforme necessário
  ];

  ngOnInit(): void {
    this.createCategoryChart();
    this.createPeriodChart();
    this.createRecurrentChart();
  }

  // Função para somar despesas por categoria
  getExpensesByCategory() {
    const totals = this.expenses.reduce((acc:any, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.value;
      return acc;
    }, {});
    return totals;
  }

  // Função para agrupar despesas por período (por exemplo, por dia)
  getExpensesByPeriod() {
    const totals = this.expenses.reduce((acc:any, expense) => {
      const date = expense.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += expense.value;
      return acc;
    }, {});
    return totals;
  }

  // Função para agrupar despesas recorrentes e não recorrentes
  getRecurrentExpenses() {
    let recurrent = 0;
    let nonRecurrent = 0;
    this.expenses.forEach(expense => {
      if (expense.recurring) {
        recurrent += expense.value;
      } else {
        nonRecurrent += expense.value;
      }
    });
    return { recurrent, nonRecurrent };
  }

  // Gráfico de Despesas por Categoria
  createCategoryChart() {
    const categoryTotals = this.getExpensesByCategory();
    this.categoryChartOptions = {
      series: [{
        data: Object.values(categoryTotals)
      }],
      chart: {
        type: 'bar',
        height: 250,

        // with: 10
      },
      xaxis: {
        categories: Object.keys(categoryTotals)
      },
      title: {
        text: 'Despesas por Categoria'
      }
    };
  }

  // Gráfico de Despesas por Período (por exemplo, por dia)
  createPeriodChart() {
    const periodTotals = this.getExpensesByPeriod();
    this.periodChartOptions = {
      series: [{
        name: 'Despesas',
        data: Object.values(periodTotals)
      }],
      chart: {
        type: 'line',
        height: 250
      },
      xaxis: {
        categories: Object.keys(periodTotals)
      },
      title: {
        text: 'Despesas por Período'
      }
    };
  }

  // Gráfico de Despesas Recorrentes vs. Não Recorrentes
  createRecurrentChart() {
    const recurrentTotals = this.getRecurrentExpenses();
    this.recurrentChartOptions = {
      series: [recurrentTotals.recurrent, recurrentTotals.nonRecurrent],
      chart: {
        type: 'donut',
        height: 250
      },
      labels: ['Recorrentes', 'Não Recorrentes'],
      title: {
        text: 'Despesas Recorrentes vs Não Recorrentes'
      }
    };
  }

}

