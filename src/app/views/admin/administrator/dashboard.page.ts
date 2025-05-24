import { Component, AfterViewInit, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  peopleCircleOutline,
  statsChartOutline,
  settingsOutline,
  homeOutline,
  peopleOutline,
  documentTextOutline
} from 'ionicons/icons';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels'; // Import del plugin datalabels

type ActivityStatus = 'not-accepted' | 'accepted' | 'in-progress' | 'on-the-way' | 'finished';

interface Activity {
  task: string;
  duration: string;
  payment: string;
  status?: ActivityStatus;
  progress?: number;
  date?: string;
}

interface WorkerActivity {
  name: string;
  task: string;
  status: ActivityStatus;
  history: Activity[];
}

interface PopularJob {
  job: string;
  count: number;
  category: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DashboardPage implements AfterViewInit, OnInit, OnDestroy {
  name = 'Dashboard';

  homeWorkersCount = 10;
  workersCount = 120;
  ordersCount = 1500;

  topWorkers = [
    { name: 'Electricity', points: 100 },
    { name: 'Plumbing', points: 95 },
    { name: 'Gardening', points: 90 },
    { name: 'Painting', points: 85 },
    { name: 'Cleaning', points: 80 }
  ];

  ordersData = [120, 140, 130, 150, 160, 170, 180];
  days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  selectedSegment: 'daily' | 'weekly' | 'monthly' = 'daily';
  selectedWorkerSegment: 'daily' | 'weekly' | 'monthly' = 'daily';
  selectedArea: 'all' | 'hotel' | 'casino' = 'all';

  popularJobs: Record<'daily' | 'weekly' | 'monthly', PopularJob[]> = {
    daily: [
      { job: 'Cleaning', count: 8, category: 'cleaning' },
      { job: 'Cleaning', count: 5, category: 'hotel' },
      { job: 'Cleaning', count: 2, category: 'security' },

      { job: 'Cooking', count: 12, category: 'hotel' },

      { job: 'paint', count: 6, category: 'maintenance' },
      { job: 'Room Service', count: 1, category: 'hotel' },

      { job: 'Security patrol', count: 3, category: 'security' },
      { job: 'Security patrol', count: 4, category: 'casino' },

      { job: 'Cashier', count: 7, category: 'casino' }
    ],

    weekly: [
      { job: 'Cleaning', count: 40, category: 'cleaning' },
      { job: 'Cleaning', count: 25, category: 'hotel' },
      { job: 'Cleaning', count: 10, category: 'security' },

      { job: 'Cooking', count: 60, category: 'hotel' },

      { job: 'Gardening', count: 30, category: 'maintenance' },
      { job: 'Room Service', count: 5, category: 'hotel' },

      { job: 'Security patrol', count: 15, category: 'security' },
      { job: 'Security patrol', count: 20, category: 'casino' },

      { job: 'Cashier', count: 35, category: 'casino' }
    ],

    monthly: [
      { job: 'Cleaning', count: 160, category: 'cleaning' },
      { job: 'Cleaning', count: 100, category: 'hotel' },
      { job: 'Cleaning', count: 40, category: 'security' },

      { job: 'Cooking', count: 240, category: 'hotel' },

      { job: 'Gardening', count: 120, category: 'maintenance' },
      { job: 'Room Service', count: 20, category: 'hotel' },

      { job: 'Security patrol', count: 60, category: 'security' },
      { job: 'Security patrol', count: 80, category: 'casino' },

      { job: 'Cashier', count: 140, category: 'casino' }
    ]
  };

  currentPopularJobs: PopularJob[] = [];
  mostRequestedLabels = ['Electricity', 'Plumbing', 'Gardening', 'Painting', 'Cleaning'];
  mostRequestedData = [30, 25, 20, 15, 10];

  timelineEvents = [
    { module: 'Cleaning', description: 'Ana was assigned cleaning work', date: '2025-05-18 10:00 AM' },
    { module: 'Gardening', description: 'Gardening work completed by Jose', date: '2025-05-18 11:30 AM' },
    { module: 'Orders', description: 'Order registered by customer Juan Pérez', date: '2025-05-18 01:15 PM' }
  ];

  workersActivity: WorkerActivity[] = [
    {
      name: 'Juan Pérez',
      task: 'Fixing electrical circuit',
      status: 'in-progress',
      history: [
        { task: 'Repair plumbing', duration: '2h', payment: '$50', status: 'finished', progress: 100 },
        { task: 'Install light fixture', duration: '1h', payment: '$30', status: 'finished', progress: 100 }
      ]
    },
    {
      name: 'María López',
      task: 'Painting hallway',
      status: 'accepted',
      history: [
        { task: 'Paint living room', duration: '3h', payment: '$75', status: 'finished', progress: 100 },
        { task: 'Wall repair', duration: '1.5h', payment: '$40', status: 'finished', progress: 100 }
      ]
    },
    {
      name: 'Carlos Ramírez',
      task: 'Cleaning office',
      status: 'not-accepted',
      history: [
        { task: 'Clean conference room', duration: '1h', payment: '$20', status: 'finished', progress: 100 }
      ]
    }
  ];

  historyFilter: 'day' | 'week' | 'month' = 'day';

  ordersChart?: Chart;
  popularJobsChart?: Chart;
  mostRequestedJobsChart?: Chart;

  @ViewChild('ordersChart', { static: false }) ordersChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('popularJobsChart', { static: false }) popularJobsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mostRequestedChart', { static: false }) mostRequestedChartRef!: ElementRef<HTMLCanvasElement>;

  maxJobCount: number = 0;

  constructor() {
    addIcons({
      'people-circle-outline': peopleCircleOutline,
      'stats-chart-outline': statsChartOutline,
      'settings-outline': settingsOutline,
      'home-outline': homeOutline,
      'people-outline': peopleOutline,
      'document-text-outline': documentTextOutline
    });
    Chart.register(...registerables, ChartDataLabels);
  }

  ngOnInit() {
    this.currentPopularJobs = this.popularJobs[this.selectedSegment];
    this.updateMaxJobCount();
  }

  ngAfterViewInit() {
    Promise.resolve().then(() => {
      this.createOrdersGraph();
      this.createPopularJobsGraph();
      this.createMostRequestedJobsGraph();
    });
  }

  ngOnDestroy() {
    this.ordersChart?.destroy();
    this.popularJobsChart?.destroy();
    this.mostRequestedJobsChart?.destroy();
  }

  updateMaxJobCount() {
    if (this.currentPopularJobs.length > 0) {
      this.maxJobCount = Math.max(...this.currentPopularJobs.map(job => job.count));
    } else {
      this.maxJobCount = 1;
    }
  }

  createOrdersGraph() {
    const ctx = this.ordersChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;
    this.ordersChart?.destroy();
    this.ordersChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.days,
        datasets: [{
          label: 'Orders',
          data: this.ordersData,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  createPopularJobsGraph() {
    const ctx = this.popularJobsChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;
    this.popularJobsChart?.destroy();

    const allJobs = this.popularJobs[this.selectedSegment] || [];

    // Unique job labels for X axis
    const labels = Array.from(new Set(allJobs.map(job => job.job)));

    // Categories filtered by selectedArea
    let categories: string[] = [];
    if (this.selectedArea === 'all') {
      categories = Array.from(new Set(allJobs.map(job => job.category)));
    } else if (this.selectedArea === 'hotel') {
      categories = ['hotel', 'cleaning', 'maintenance', 'security'];
    } else if (this.selectedArea === 'casino') {
      categories = ['casino', 'security'];
    }

    const datasets = categories.map(category => {
      const data = labels.map(label => {
        const job = allJobs.find(j => j.job === label && j.category === category);
        return job ? job.count : 0;
      });

      return {
        label: category.charAt(0).toUpperCase() + category.slice(1),
        data,
        backgroundColor: this.getJobHexColor(category),
        stack: 'Stack 0'
      };
    });

    this.popularJobsChart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: { position: 'top' },
          tooltip: { enabled: true },
          datalabels: {
            color: 'white',
            font: { weight: 'bold' },
            formatter: (value: number, context) => {
              const dataset = context.dataset.data as number[];
              const total = dataset.reduce((a, b) => a + b, 0);
              if (total === 0) return '';
              const percent = ((value / total) * 100).toFixed(0);
              return value > 0 && (value / total) > 0.05 ? `${percent}%` : '';
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }
createMostRequestedJobsGraph() {
  const ctx = this.mostRequestedChartRef?.nativeElement.getContext('2d');
  if (!ctx) return;
  this.mostRequestedJobsChart?.destroy();

  const labelCategoryMap: Record<string, string> = {
    'Electricity': 'maintenance',
    'Plumbing': 'maintenance',
    'Painting': 'maintenance',
    'Cleaning': 'cleaning',
  };

  const backgroundColors = this.mostRequestedLabels.map(label => {
    const category = labelCategoryMap[label.toString()] || 'cleaning';
    return this.getJobHexColor(category);
  });

  this.mostRequestedJobsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: this.mostRequestedLabels,
      datasets: [{
        data: this.mostRequestedData,
        backgroundColor: backgroundColors,
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%' as any,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 18, padding: 15 }
        },
        datalabels: {
          color: '#fff',
          font: { weight: 'bold', size: 14 },
          formatter: (value: number, context: Context) => {
            const dataset = context.chart.data.datasets[0];
            const data = Array.isArray(dataset.data) ? dataset.data as number[] : [];
            const total = data.reduce((a, b) => a + b, 0);
            if (total === 0) return '';
            const percent = ((value / total) * 100).toFixed(1);
            return `${percent}%`;
          }
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (ctx: any) => {
  const label = ctx.label || '';
  const value = ctx.parsed;
  return `${label}: ${value}`;
}
          }
        }
      }
    } as any,
    plugins: [ChartDataLabels]
  });
}
  onSegmentChanged(event: CustomEvent) {
    this.selectedSegment = event.detail.value;
    this.currentPopularJobs = this.popularJobs[this.selectedSegment];
    this.updateMaxJobCount();
    this.createPopularJobsGraph();
  }

  onWorkerSegmentChanged(event: CustomEvent) {
    this.selectedWorkerSegment = event.detail.value;
    // Puedes implementar lógica para cambiar la vista de trabajadores si es necesario
  }

  onAreaChanged(event: CustomEvent) {
    this.selectedArea = event.detail.value;
    this.createPopularJobsGraph();
  }

  getJobHexColor(category: string): string {
    switch (category) {
      case 'cleaning': return '#008000';       // Green
      case 'hotel': return '#C0392B';          // Dark Red
      case 'maintenance': return '#87CEEB';    // Light Blue
      case 'security': return '#FFC300';       // Yellow
      case 'casino': return '#E67E22';         // Orange
      default: return '#888888';                // Gray
    }
  }

  formatDuration(duration: string): string {
    // Ejemplo de función que puede convertir duración en minutos a formato legible si es necesario
    return duration;
  }

  getStatusColor(status: ActivityStatus): string {
    switch (status) {
      case 'not-accepted': return '#e74c3c';  // red
      case 'accepted': return '#3498db';      // blue
      case 'in-progress': return '#f39c12';  // orange
      case 'on-the-way': return '#9b59b6';   // purple
      case 'finished': return '#2ecc71';      // green
      default: return '#95a5a6';              // gray
    }
  }

  getStatusText(status: ActivityStatus): string {
    switch (status) {
      case 'not-accepted': return 'No Aceptado';
      case 'accepted': return 'Aceptado';
      case 'in-progress': return 'En Progreso';
      case 'on-the-way': return 'En Camino';
      case 'finished': return 'Finalizado';
      default: return 'Desconocido';
    }
  }

  getCurrentProgress(worker: WorkerActivity): number {
    if (worker.history && worker.history.length > 0) {
      const lastTask = worker.history[worker.history.length - 1];
      if (lastTask.progress !== undefined) {
        return lastTask.progress / 100;
      }
    }
    if (worker.status === 'finished') return 1;
    return 0;
  }
}
