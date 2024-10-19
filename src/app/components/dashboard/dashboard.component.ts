import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from "../layout/navbar/navbar.component";
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';


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
  imports: [NavbarComponent, NgApexchartsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements  AfterViewInit {
  public chartOptions: ApexOptions;


  constructor() {
    this.chartOptions = {
      chart: {
        height: '100%',
        width: '100%',
        type: 'area',
        fontFamily: 'Inter, sans-serif',
        dropShadow: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        enabled: true,
        x: {
          show: false,
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: '#1C64F2',
          gradientToColors: ['#1C64F2'],
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 6,
      },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: 0,
        },
      },
      series: [
        {
          name: 'New users',
          data: [6500, 6418, 6456, 6526, 6356, 6456],
        },
      ],
      xaxis: {
        categories: ['01 February', '02 February', '03 February', '04 February', '05 February', '06 February', '07 February'],
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        show: false,
      },
    };
  }

  ngAfterViewInit() {

  }





}
