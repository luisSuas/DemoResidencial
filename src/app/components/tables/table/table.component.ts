import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, computed, effect, inject, input, model, output, signal, viewChild } from '@angular/core';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subscription, firstValueFrom } from 'rxjs';
import { ColumnDataTable, ColumnType } from 'src/interfaces/interface/ColumnDataTable';



import { IonButton, IonIcon, IonPopover, IonImg, IonAvatar } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { arrowDown, arrowUp, chevronBack, chevronForward, ellipsisVertical, map } from 'ionicons/icons';

import { DataActionsComponent } from '../data-actions/data-actions.component';
import { ActionTable, SelectableOption, convertActionsToSelectableOptions } from 'src/interfaces/interface/SelectableOption.model';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { GETMultipleResponse } from 'src/interfaces/interface/DefaultHttpMessage.model';
import { DirectionUtilitiesService } from 'src/app/services/utilities/direction.utilities.service';


@Component({
  selector: 'data-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: true,
  imports: [
    IonAvatar, IonImg,
    IonPopover,
    IonIcon, IonButton,
    DatePipe,
    MatTableModule,
    MatSortModule,
    DataActionsComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent<T = { [key: string]: any }> implements OnDestroy {

  dataActionPopover = viewChild<IonPopover>("dataActionPopover");
  sort = viewChild(MatSort);

  actionButtonPress = signal<boolean>(false);
  actionPerformPressed = output<{ action: ActionTable, element: T }>();

  nextId = output<number>();

  // CONSTANTS
  ColumnType = ColumnType;
  actionOptions = input.required<ActionTable[]>();

  options = computed<SelectableOption<ActionTable>[]>(() => convertActionsToSelectableOptions(this.actionOptions()));


  // INPUTS
  orderOptions = input.required<string[]>();
  sortColumn = model.required<string>();
  sortDirection = model<'desc' | 'asc'>('asc');

  columns = input.required<ColumnDataTable<T>[]>();
  modelPath = input.required<string>();
  extraQueries = input<{ [key: string]: string | number | null }>({}); // extra queries to filter data

  modelFormatter = input<(model: T) => T>(model => model);

  searchText = model<string>("");


  // COMPUTED
  displayedColumns = computed(() => this.columns().map(column => column.key));

  dataSource: MatTableDataSource<T> = new MatTableDataSource<T>();


  // DEPENDENCIES
  private _httpClient: HttpClient = inject(HttpClient);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private directionUtilitiesService = inject(DirectionUtilitiesService);

  pageSize = input.required<number>();
  itemsPerPageLabel = computed(() => `Elementos por página: ${this.pageSize()}`);
  length = signal<number>(0);

  page = signal<number>(1);
  disable_next = signal(false);
  disable_prev = signal(true);

  actualDirection: 'nextPage' | 'prevPage' | "none" = 'none';

  elementSelected: T | null = null;

  readonly subs = new Subscription();

  constructor(

  ) {
    addIcons({ map, ellipsisVertical, chevronBack, chevronForward, arrowDown, arrowUp });
    effect(() => {
      this.loadTableData();
    })

    this.subs.add(this.searchText.subscribe((previousSearch) => {
      this.length.set(0);
      this.page.set(1);
    }))
  }

  async loadTableData() {
    let url = this.HTTPGETRequestURL(
      this.sortColumn(),
      this.sortDirection(),
      this.searchText(),
      this.page(),
      this.pageSize(),
      this.extraQueries()
    );
    let response = await firstValueFrom(this._httpClient.get<GETMultipleResponse<T>>(url));
    if (this.modelFormatter()) {
      response.rows = response.rows.map(this.modelFormatter());
    }
    this.dataSource.data = response.rows;

    // Set length of data as number of pages, where response.count is the total of all elements, and pageSize is the number of elements per page
    this.length.set(Math.ceil(response.count / this.pageSize()));

    if (response.nextId)
      this.nextId.emit(response.nextId);

    this.cdr.markForCheck();
  }


  HTTPGETRequestURL(column: string, direction: string, searchText: string, page: number, size: number, extraQueries: { [key: string]: string | number | null }) {
    console.log('extraQueries', extraQueries);
    let queries = Object.keys(extraQueries).map(key => `${key}=${extraQueries[key]}`).join('&');
    return `${this.modelPath()}?column=${column}&direction=${direction}&searchText=${searchText}&page=${page}&size=${size}${queries ? `&${queries}` : ''}`;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  async showActions(event: MouseEvent, element: T) {
    this.actionButtonPress.set(true)
    this.elementSelected = element;
    setTimeout(() => {
      this.dataActionPopover()?.present(event);
    }, 100);

  }

  actionSelected(action: ActionTable) {
    if (this.elementSelected === null) return;
    this.actionPerformPressed.emit({ action, element: this.elementSelected });
    this.elementSelected = null;
  }

  columnNotInSortOptions(key: keyof T extends string ? keyof T : never) {
    return !this.orderOptions().includes(key);
  }

  sortChange(sort: Sort) {
    this.sortColumn.set(sort.active);
    this.sortDirection.set(sort.direction === "asc" ? "asc" : "desc");
  }

  changePage(direction: 'nextPage' | 'prevPage') {
    this.page.update((prev) => {
      if (direction === 'nextPage') {
        return prev + 1;
      } else {
        return prev - 1;
      }
    })
  }

  reload() {
    this.loadTableData();
  }

  showRoute(element: [number, number]) {
    this.directionUtilitiesService.openRoute(element);
  }

  openImage(url: string) {
    window.open(url, "_blank")
  }
}
