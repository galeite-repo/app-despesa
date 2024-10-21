import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from "../layout/navbar/navbar.component";
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import ApexCharts from 'apexcharts';
import { BarChartComponent } from './bar-chart/bar-chart.component';


export type ChartOptions = {
  series: {
    name: string;
    data: number[];
  }[];
  chart: {
    type: string;
    height: number;
  };
  xaxis: {
    categories: string[];
  };
};


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, NgApexchartsModule, CommonModule, BarChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent  {


  constructor() {

  }



}
