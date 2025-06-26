import { Component, AfterViewInit, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { IonicModule} from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  peopleCircleOutline,
  statsChartOutline,
  settingsOutline,
  homeOutline,
  peopleOutline,
  documentTextOutline,
  star,
  calendarOutline,
  timeOutline,
  cashOutline
} from 'ionicons/icons';

import { Chart, registerables } from 'chart.js';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels'; // Import del plugin datalabels

type ActivityStatus = 'not-accepted' | 'accepted' | 'in-progress' | 'on-the-way' | 'finished';
type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

// Registro de tareas realizadas
interface Activity {
  task: string;
  duration: string;
  payment: string;
  status?: ActivityStatus;
  progress?: number;
  date?: string;
}

// NUEVO: Entradas del log de estado
interface StatusLogEntry {
  state: string;        // Ej: "Oferta publicada"
  date?: string;        // Fecha o timestamp
  images?: string[];    // Rutas o URLs de imágenes
  payment?: string;     // Pago final
  rating?: number;      // 1..5 estrellas
}

interface WorkerActivity {
  name: string;
  task: string;
  status: ActivityStatus;
  history: Activity[];
  statusLog?: StatusLogEntry[]; // <--- log añadido
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
    currentSection: 'tenant'|'worker'|'orders' = 'tenant';
    selectedSegment: 'daily' | 'weekly' | 'monthly' = 'daily';
  selectedWorkerSegment: 'daily' | 'weekly' | 'monthly' = 'daily';
  days: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

 // ─── TENANT KPIs ───
  completionRate = 0.85;                  // 85% tasks completed
  avgResponseTime = 28;                   // avg response in minutes
  upcomingTasks = ['Fix AC', 'Inspect Room', 'Clean Lobby'];

  // ─── WORKER KPIs ───
  @ViewChild('statusPie', { static: false }) statusPieRef!: ElementRef<HTMLCanvasElement>;
  statusPie?: Chart;

  // ─── ORDERS KPIs ───
  @ViewChild('trendLine', { static: false }) trendLineRef!: ElementRef<HTMLCanvasElement>;
  trendChart?: Chart;
  cancelRate = 0.04;                      // 4% cancellations
  ordersFinished: Record<'daily' | 'weekly' | 'monthly', number> = {
    daily: 1500,
    weekly: 8000,
    monthly: 30000
  };
  goal = 2000;
  goalProgress = this.ordersFinished[this.selectedSegment] / this.goal;

  homeWorkersCount = 10;
  workersCount = 120;
  ordersCount = 1500;

  topWorkers = [
    { name: 'Room Cleaning', points: 100 },
    { name: 'Plumbing', points: 95 },
    { name: 'Painting', points: 90 },
    { name: 'Electricity', points: 85 },
    { name: 'Carpet Cleaning', points: 80 }
  ];

 ordersByStatus: Record<Day, { accepted: number; inProgress: number; notAccepted: number }> = {
  Mon: { accepted: 50, inProgress: 40, notAccepted: 30 },
  Tue: { accepted: 60, inProgress: 50, notAccepted: 30 },
  Wed: { accepted: 55, inProgress: 45, notAccepted: 30 },
  Thu: { accepted: 70, inProgress: 50, notAccepted: 30 },
  Fri: { accepted: 65, inProgress: 55, notAccepted: 40 },
  Sat: { accepted: 75, inProgress: 60, notAccepted: 35 },
  Sun: { accepted: 80, inProgress: 70, notAccepted: 30 }
};

  
 
 

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

 // 1. Agrupamos las actividades por periodo
  workerActivitiesByPeriod: Record<'daily'|'weekly'|'monthly', WorkerActivity[]> = {
    daily: [
      {
        name: 'Juan Pérez',
        task: 'Fixing electrical circuit',
        status: 'in-progress',
        history: [
          { task: 'Repair plumbing', duration: '2h', payment: '$50', status: 'finished', progress: 100 },
          { task: 'Install light fixture', duration: '1h', payment: '$30', status: 'finished', progress: 100 }
        ],
        statusLog: [
          {state:'Posted offer', date:'2025-06-01'},
          {state:'Offer accepted by the worker', date:'2025-06-02'},
          {state:'Scheduled date', date:'2025-06-03'},
          {state:'Work on site completed', date:'2025-06-04', images:['/assets/site1.jpg','/assets/site2.jpg']}
        ]
      },
      {
        name: 'María López',
        task: 'Painting hallway',
        status: 'accepted',
        history: [
          { task: 'Paint living room', duration: '3h', payment: '$75', status: 'finished', progress: 100 },
          { task: 'Wall repair', duration: '1.5h', payment: '$40', status: 'finished', progress: 100 }
        ],
         statusLog: [
          {state:'Posted offer', date:'2025-06-01'},
          {state:'Offer accepted by the worker', date:'2025-06-02'},
           { state: 'Star rating', date: '2025-06-17', rating: 3 }
        ]
      },
      {
        name: 'Carlos Ramírez',
        task: 'Cleaning office',
        status: 'not-accepted',
        history: [
          { task: 'Clean conference room', duration: '1h', payment: '$20', status: 'finished', progress: 100 }
        ],
        statusLog: [
          {state:'Posted offer', date:'2025-06-01'},
          {state:'Not accepted by the worker', date:'2025-06-02'}
        ]
      }
    ],
     // Datos para “Weekly”
  weekly: [
    {
      name: 'Juan Pérez',
      task: 'Roof inspection',
      status: 'finished',
      history: [
        { task: 'Repair plumbing',         duration: '2h',   payment: '$50', status: 'finished',   progress: 100 },
        { task: 'Install light fixture',   duration: '1h',   payment: '$30', status: 'finished',   progress: 100 },
        { task: 'Maintenance check',       duration: '1.5h', payment: '$45', status: 'finished',   progress: 100 },
        { task: 'Electrical inspection',   duration: '2h',   payment: '$60', status: 'finished',   progress: 100 }
      ],
        statusLog:[
          {state:'Offer posted',date:'2025-05-28'},
          {state:'Offer accepted by the worker',date:'2025-05-29'},
          {state:'Date planned',date:'2025-05-30'},
          {state:'Site completion',date:'2025-06-01',payment:'$75'},
           { state: 'Star rating', date: '2025-06-09', rating: 5 }
        ]
    },
    {
      name: 'María López',
      task: 'Hallway repaint',
      status: 'in-progress',
      history: [
        { task: 'Paint living room',       duration: '3h',   payment: '$75', status: 'finished',   progress: 100 },
        { task: 'Wall repair',             duration: '1.5h', payment: '$40', status: 'finished',   progress: 100 },
        { task: 'Hallway repaint',         duration: '2h',   payment: '$80', status: 'in-progress',progress: 50  }
      ],
      statusLog:[
          {state:'Offer posted',date:'2025-05-28'},
          {state:'Offer accepted by the worker',date:'2025-05-29'},
          {state:'Work being performed on site',date:'2025-05-30',images:['/assets/hall1.jpg']}
        ]
    },
    {
      name: 'Carlos Ramírez',
      task: 'Office deep clean',
      status: 'accepted',
      history: [
        { task: 'Clean conference room',   duration: '1h',   payment: '$20', status: 'finished',   progress: 100 },
        { task: 'Disinfect office',        duration: '1.5h', payment: '$35', status: 'accepted',  progress: 0   }
      ],
      statusLog:[
          {state:'Offer posted',date:'2025-05-28'},
          {state:'Offer accepted by the worker',date:'2025-05-29'},
           { state: 'Star rating', date: '2025-05-10', rating: 3 }
        ]
    }
  ],

  // Datos para “Monthly”
  monthly: [
    {
      name: 'Juan Pérez',
      task: 'Full system audit',
      status: 'in-progress',
      history: [
        { task: 'Repair plumbing',         duration: '2h',   payment: '$50', status: 'finished',   progress: 100 },
        { task: 'Install light fixture',   duration: '1h',   payment: '$30', status: 'finished',   progress: 100 },
        { task: 'Maintenance check',       duration: '1.5h', payment: '$45', status: 'finished',   progress: 100 },
        { task: 'Electrical inspection',   duration: '2h',   payment: '$60', status: 'finished',   progress: 100 },
        { task: 'Full system audit',       duration: '3h',   payment: '$90', status: 'in-progress',progress: 60  }
      ],
      statusLog:[
          {state:'Offer posted',date:'2025-05-01'},
          {state:'Offer accepted by the employee',date:'2025-05-02'}
        ]
    },
    {
      name: 'María López',
      task: 'Lobby makeover',
      status: 'finished',
      history: [
        { task: 'Paint living room',       duration: '3h',   payment: '$75', status: 'finished',   progress: 100 },
        { task: 'Wall repair',             duration: '1.5h', payment: '$40', status: 'finished',   progress: 100 },
        { task: 'Hallway repaint',         duration: '2h',   payment: '$80', status: 'finished',   progress: 100 },
        { task: 'Lobby makeover',          duration: '5h',   payment: '$150',status: 'finished',   progress: 100 }
      ],
      statusLog:[
          {state:'Offer published',date:'2025-05-01'},
          {state:'Offer accepted by the employee',date:'2025-05-02'},
          {state:'Site termination',date:'2025-05-10',payment:'$150'},
          { state: 'Star rating', date: '2025-05-10', rating: 5 }
        ]
    },
    {
      name: 'Carlos Ramírez',
      task: 'Monthly maintenance',
      status: 'not-accepted',
      history: [
        { task: 'Clean conference room',   duration: '1h',   payment: '$20', status: 'finished',   progress: 100 },
        { task: 'Disinfect office',        duration: '1.5h', payment: '$35', status: 'finished',   progress: 100 },
        { task: 'Monthly maintenance',     duration: '2h',   payment: '$60', status: 'not-accepted',progress: 0   }
      ],
      statusLog:[
          {state:'Offer published',date:'2025-05-01'},
          {state:'Not accepted by the worker',date:'2025-05-02'}
        ]
    }
  ]
};

  // 2. Inicializamos con el periodo "daily"
  workersActivity: WorkerActivity[] = this.workerActivitiesByPeriod['daily'];

  historyFilter: 'day' | 'week' | 'month' = 'day';

  ordersChart?: Chart;
  popularJobsChart?: Chart;
  mostRequestedJobsChart?: Chart;

  @ViewChild('ordersChart', { static: false }) ordersChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('popularJobsChart', { static: false }) popularJobsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mostRequestedChart', { static: false }) mostRequestedChartRef!: ElementRef<HTMLCanvasElement>;

  maxJobCount: number = 0;

  constructor(private cd: ChangeDetectorRef) {
  addIcons({
    'people-circle-outline': peopleCircleOutline,
    'stats-chart-outline':   statsChartOutline,
    'settings-outline':      settingsOutline,
    'home-outline':          homeOutline,
    'people-outline':        peopleOutline,
    'document-text-outline': documentTextOutline,
      'star':                   star,
      'calendar-outline':       calendarOutline,
      'time-outline':           timeOutline,
      'cash-outline':           cashOutline
  });
  Chart.register(...registerables, ChartDataLabels);
}

  getTotalHours(worker: any): number {
  return worker.history.reduce((sum: number, task: any) => sum + task.duration, 0);
}

getTotalPayment(worker: any): string {
  const total = worker.history.reduce((sum: number, task: any) => sum + parseFloat(task.payment.replace('$', '')), 0);
  return `$${total.toFixed(2)}`;
}
    onSectionChange(section: 'tenant'|'worker'|'orders') {
    this.currentSection = section;   // keep ngModel happy
    this.cd.detectChanges();
    // give Angular one micro-tick so the new canvas is actually in the DOM
  setTimeout(() => {
    switch (section) {
      case 'tenant':
        this.createPopularJobsGraph();
        this.createMostRequestedJobsGraph();
        break;
      case 'worker':
        this.createStatusChart();
        break;
      case 'orders':
        this.createOrdersGraph();
        this.createTrendChart();
        this.updateGoalProgress();
        this.createMostRequestedJobsGraph();
        break;
    }
  }, 0);
}


  ngOnInit() {
  this.updateCurrentPopularJobs();
  this.updateMaxJobCount();
  this.updateGoalProgress();
}


  ngAfterViewInit() {
    Promise.resolve().then(() => {
      this.createOrdersGraph();
      this.createPopularJobsGraph();
      this.createMostRequestedJobsGraph();
       this.createStatusChart();
      this.createTrendChart();
    });
  }

  ngOnDestroy() {
    this.ordersChart?.destroy();
    this.popularJobsChart?.destroy();
    this.mostRequestedJobsChart?.destroy();
     this.statusPie?.destroy();
    this.trendChart?.destroy();
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
    type: 'bar',
    data: {
      labels: this.days,
      datasets: [
        {
          label: 'Accepted',
          data: this.days.map(day => this.ordersByStatus[day].accepted),
          backgroundColor: '#2ecc71',  // verde
          stack: 'Stack 0'
        },
        {
          label: 'In Progress',
          data: this.days.map(day => this.ordersByStatus[day].inProgress),
          backgroundColor: '#f1c40f',  // amarillo
          stack: 'Stack 0'
        },
        {
          label: 'Not Accepted',
          data: this.days.map(day => this.ordersByStatus[day].notAccepted),
          backgroundColor: '#e74c3c',  // rojo
          stack: 'Stack 0'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  });
}

 createPopularJobsGraph() {
  const ctx = this.popularJobsChartRef.nativeElement.getContext('2d');
  if (!ctx) return;
  this.popularJobsChart?.destroy();

  // 1) Filtramos sólo las categorías de hotel
  const hotelCats = ['hotel', 'cleaning', 'maintenance', 'security'];
  const allJobs = (this.popularJobs[this.selectedSegment] || [])
    .filter(j => hotelCats.includes(j.category));

  // 2) Etiquetas únicas de trabajos
  const labels = Array.from(new Set(allJobs.map(j => j.job)));

  // 3) Preparamos un dataset por categoría
  const datasets = hotelCats.map(cat => ({
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    data: labels.map(jobName => {
      const job = allJobs.find(j => j.job === jobName && j.category === cat);
      return job ? job.count : 0;
    }),
    backgroundColor: this.getJobHexColor(cat),
    stack: 'a'
  }));

  // 4) Creamos el chart apilado
 this.popularJobsChart = new Chart(ctx, {
  type: 'bar',
  data:{ labels, datasets },
  options:{
    responsive: true,
    maintainAspectRatio: false,
    scales:{ x:{stacked:true}, y:{stacked:true,beginAtZero:true} },
    plugins: {
    legend: { position: 'top' },
    datalabels: {
      color: 'white',
      font: { weight: 'bold' },
      // sólo dibujo la etiqueta si existe y es > 0
      display: (ctx: any) => {
        const data = ctx.dataset?.data as number[] | undefined;
        if (!Array.isArray(data)) return false;
        return data[ctx.dataIndex] > 0;
      },
      formatter: (value: number) => value
    }
  }
  },
  plugins:[ChartDataLabels]
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
  this.updateCurrentPopularJobs();
  this.updateMaxJobCount();
  this.createPopularJobsGraph();
   this.updateGoalProgress();
    this.createTrendChart();
}

  // 3. Reemplazamos lógica para cargar actividades según periodo
  onWorkerSegmentChanged(event: CustomEvent) {
    this.selectedWorkerSegment = event.detail.value;
    this.workersActivity = this.workerActivitiesByPeriod[this.selectedWorkerSegment];
     this.createStatusChart();
  }
 isDelayed(worker: WorkerActivity) {
    return worker.status === 'in-progress';
  }

  onAreaChanged(event: CustomEvent) {
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
    case 'not-accepted': return 'Not Accepted';
    case 'accepted':     return 'Accepted';
    case 'in-progress':  return 'In Progress';
    case 'on-the-way':   return 'On The Way';
    case 'finished':     return 'Finished';
    default:             return 'Unknown';
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
/** Devuelve color de barra según estado */
getProgressBarColor(worker: WorkerActivity): string {
  if (worker.status === 'in-progress')      return '#f1c40f'; // amarillo
  if (worker.status === 'accepted' 
   || worker.status === 'finished')         return '#2ecc71'; // verde
  return '#e74c3c';                          // rojo para not-accepted
}


getProgressBarWidth(worker: WorkerActivity): string {
  let pct = 0;
  if (worker.status === 'in-progress') {
    pct = 50;
  } else if (worker.status === 'accepted' || worker.status === 'finished') {
    pct = 100;
  }
  // not-accepted → 0%
  return `${pct}%`;
}

  /** Borde verde solo si está completo o aceptado */
getProgressBarBorder(worker: WorkerActivity): string {
  return (worker.status === 'accepted' || worker.status === 'finished')
    ? `2px solid ${this.getProgressBarColor(worker)}`
    : 'none';
}
  getCardShadow(worker: WorkerActivity): string {
    const c = this.getProgressBarColor(worker);
    return `0 4px 8px 0 ${c}`;
  }

updateCurrentPopularJobs(){
    const arr = this.popularJobs[this.selectedSegment]||[];
    const group:{[k:string]:number} = {};
    arr.forEach(j=>{
      group[j.job] = (group[j.job]||0) + j.count;
    });
    this.currentPopularJobs = Object.entries(group)
      .map(([job,count])=>({ job, count, category:'hotel' }));
  }
getStarsArray(count: number): any[] {
  return Array(count);
}

 // ─── ORDERS Goals ───
  updateGoalProgress() {
    this.goalProgress = this.ordersFinished[this.selectedSegment] / this.goal;
  }

  createStatusChart() {
    const ctx = this.statusPieRef.nativeElement.getContext('2d');
    if (!ctx) return;
    this.statusPie?.destroy();
    const counts: Record<string, number> = {};
    this.workersActivity.forEach(w => {
      counts[w.status] = (counts[w.status] || 0) + 1;
    });
    const labels = Object.keys(counts);
    const data = labels.map(l => counts[l]);
    const bg = labels.map(l => this.getStatusColor(l as ActivityStatus));
    this.statusPie = new Chart(ctx, {
      type: 'pie',
      data: { labels, datasets: [{ data, backgroundColor: bg }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  createTrendChart() {
    const ctx = this.trendLineRef.nativeElement.getContext('2d');
    if (!ctx) return;
    this.trendChart?.destroy();
    const totals = this.days.map(d => {
      const s = this.ordersByStatus[d];
      return s.accepted + s.inProgress + s.notAccepted;
    });
    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: { labels: this.days, datasets: [{ label: 'Total Orders', data: totals, fill: false, tension: 0.3 }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

}
