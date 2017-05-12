import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Router, NavigationStart} from '@angular/router';
import {Observable} from 'rxjs/Rx';

import {Alert} from '../../model/alert';
import {AlertService} from '../../service/alert.service';
import {QueryBuilder} from '../../model/query-builder';
import {ConfigureTableService} from '../../service/configure-table.service';
import {WorkflowService} from '../../service/workflow.service';
import {SampleData} from '../../model/sample-data';
import {ClusterMetaDataService} from '../../service/cluster-metadata.service';
import {ColumnMetadata} from '../../model/column-metadata';
import {SortEvent} from '../../shared/metron-table/metron-table.directive';
import {Sort} from '../../utils/enums';
import {Pagination} from '../../model/pagination';
import {SaveSearchService} from '../../service/save-search.service';
import {RefreshInterval} from '../configure-rows/configure-rows-enums';

@Component({
  selector: 'app-alerts-list',
  templateUrl: './alerts-list.component.html',
  styleUrls: ['./alerts-list.component.scss']
})

export class AlertsListComponent implements OnInit {

  alertsColumns: ColumnMetadata[] = [];
  alertsColumnsToDisplay: ColumnMetadata[] = [];
  filtersData = SampleData.getFilters();
  selectedAlerts: Alert[] = [];
  alerts: any[] = [];
  colNumberTimerId: number;
  refreshInterval = RefreshInterval.ONE_MIN;
  refreshTimer: any;
  pauseRefresh = false;
  lastPauseRefreshValue = false;

  @ViewChild('table') table: ElementRef;

  pagingData = new Pagination();
  queryBuilder: QueryBuilder = new QueryBuilder();

  constructor(private router: Router,
              private alertsService: AlertService,
              private configureTableService: ConfigureTableService,
              private workflowService: WorkflowService,
              private clusterMetaDataService: ClusterMetaDataService,
              private saveSearchService: SaveSearchService) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart && event.url === '/alerts-list') {
        this.selectedAlerts = [];
        this.restoreRefreshState();
      }
    });
  }

  addAlertColChangedListner() {
    this.configureTableService.tableChanged$.subscribe(colChanged => {
      if (colChanged) {
        this.getAlertColumnNames();
      }
    });
  }

  addLoadSavedSearchListner() {
    this.saveSearchService.loadSavedSearch$.subscribe(queryBuilder => {
      this.queryBuilder = queryBuilder;
      this.search();
    });
  }

  formatValue(column: ColumnMetadata, returnValue: string) {
    try {
      if (column.name.endsWith(':ts') || column.name.endsWith('timestamp')) {
        returnValue = new Date(parseInt(returnValue, 10)).toISOString().replace('T', ' ').slice(0, 19);
      }
    } catch (e) {}

    return returnValue;
  }

  getAlertColumnNames() {
    Observable.forkJoin(
      this.configureTableService.getConfiguredTableColumns(),
      this.clusterMetaDataService.getDefaultColumns()
    ).subscribe((response: any) => {
      this.prepareData(response[0], response[1]);
    });
  }

  getCollapseComponentData(data: any) {
    return {
      getName: () => {
        return Object.keys(data.aggregations)[0];
      },
      getData: () => {
        return data.aggregations[Object.keys(data.aggregations)[0]].buckets;
      },
    };
  }

  getDataType(name: string): string {
    return this.alertsColumns.filter(colMetaData => colMetaData.name === name)[0].type;
  }

  getValue(alert: any, column: ColumnMetadata, formatData: boolean) {
    let returnValue = '';
    try {
      switch (column.name) {
        case '_id':
          returnValue = alert[column.name];
          break;
        case 'alert_status':
          returnValue = 'NEW';
          break;
        default:
          returnValue = alert['_source'][column.name];
          break;
      }
    } catch (e) {}

    if (formatData) {
      returnValue = this.formatValue(column, returnValue);
    }

    return returnValue;
  }

  ngOnInit() {
    this.search();
    this.getAlertColumnNames();
    this.addAlertColChangedListner();
    this.addLoadSavedSearchListner();
  }

  onClear(searchDiv) {
    searchDiv.innerText = '*';
    this.queryBuilder.query = searchDiv.innerText;
    this.search();
  }

  onSearch(searchDiv) {
    searchDiv.innerText = searchDiv.innerText.length === 0 ? '*' : searchDiv.innerText.trim();
    this.queryBuilder.query = searchDiv.innerText;
    this.search();

    return false;
  }

  onAddFilter(field: string, value: string) {
    this.queryBuilder.addOrUpdateFilter(field, value);
    this.search();
  }

  onConfigRowsChange() {
    this.alertsService.interval = this.refreshInterval;
    this.tryStopPolling();
    this.search();
  }

  onPageChange() {
    this.queryBuilder.setFromAndSize(this.pagingData.from, this.pagingData.size);
    this.search(false);
  }

  onPausePlay() {
    this.pauseRefresh = !this.pauseRefresh;
    if (this.pauseRefresh) {
      this.tryStopPolling();
    } else {
      this.search(false);
    }
  }

  onResize($event) {
    clearTimeout(this.colNumberTimerId);
    this.colNumberTimerId = setTimeout(() => { this.setColumnsToDisplay(); }, 500);
  }

  onSort(sortEvent: SortEvent) {
    let sortOrder = (sortEvent.sortOrder === Sort.ASC ? 'asc' : 'desc');
    this.queryBuilder.setSort(sortEvent.sortBy, sortOrder, this.getDataType(sortEvent.sortBy));
    this.search();
  }

  prepareData(configuredColumns: ColumnMetadata[], defaultColumns: ColumnMetadata[]) {
    this.alertsColumns = (configuredColumns && configuredColumns.length > 0) ?  configuredColumns :  defaultColumns;
    this.setColumnsToDisplay();
  }

  processEscalate() {
    this.workflowService.start(this.selectedAlerts).subscribe(workflowId => {
      this.alertsService.updateAlertState(this.selectedAlerts, 'ESCALATE', workflowId).subscribe(results => {
        this.updateSelectedAlertStatus('ESCALATE');
      });
    });
  }

  processDismiss() {
    this.alertsService.updateAlertState(this.selectedAlerts, 'DISMISS', '').subscribe(results => {
      this.updateSelectedAlertStatus('DISMISS');
    });
  }

  processOpen() {
    this.alertsService.updateAlertState(this.selectedAlerts, 'OPEN', '').subscribe(results => {
      this.updateSelectedAlertStatus('OPEN');
    });
  }

  processResolve() {
    this.alertsService.updateAlertState(this.selectedAlerts, 'RESOLVE', '').subscribe(results => {
      this.updateSelectedAlertStatus('RESOLVE');
    });
  }

  removeFilter(field: string) {
    this.queryBuilder.removeFilter(field);
    this.search();
  }

  selectAllRows($event) {
    this.selectedAlerts = [];
    if ($event.target.checked) {
      this.selectedAlerts = this.alerts;
    }
  }

  setColumnsToDisplay() {
    let availableWidth = document.documentElement.clientWidth - (200 + (15 * 3)); /* screenwidth - (navPaneWidth + (paddings))*/
    availableWidth = availableWidth - (55 + 25 + 25); /* availableWidth - (score + colunSelectIcon +selectCheckbox )*/
    let tWidth = 0;
    this.alertsColumnsToDisplay =  this.alertsColumns.filter(colMetaData => {
      if (colMetaData.type.toUpperCase() === 'DATE') {
        tWidth += 140;
      } else if (colMetaData.type.toUpperCase() === 'IP') {
        tWidth += 120;
      } else if (colMetaData.type.toUpperCase() === 'BOOLEAN') {
        tWidth += 50;
      } else {
        tWidth += 130;
      }

      return tWidth < availableWidth;
    });
  }

  search(resetPaginationParams = true) {
    this.selectedAlerts = [];

    if (resetPaginationParams) {
      this.pagingData.from = 0;
      this.queryBuilder.setFromAndSize(this.pagingData.from, this.pagingData.size);
    }

    this.alertsService.search(this.queryBuilder).subscribe(results => {
      this.setData(results);
    });

    this.tryStartPolling();
  }

  selectRow($event, alert: Alert) {
    if ($event.target.checked) {
      this.selectedAlerts.push(alert);
    } else {
      this.selectedAlerts.splice(this.selectedAlerts.indexOf(alert), 1);
    }
  }

  setData(results) {
    this.alerts = results['hits'].hits;
    this.pagingData.total = results['hits'].total;
  }

  showConfigureTable() {
    this.saveRefreshState();
    this.router.navigateByUrl('/alerts-list(dialog:configure-table)');
  }

  showDetails($event, alert: any) {
    if ($event.target.type !== 'checkbox' && $event.target.parentElement.firstChild.type !== 'checkbox' && $event.target.nodeName !== 'A') {
      this.selectedAlerts = [];
      this.selectedAlerts = [alert];
      this.saveRefreshState();
      this.router.navigateByUrl('/alerts-list(dialog:details/' + alert._index + '/' + alert._type + '/' + alert._id + ')');
    }
  }

  saveRefreshState() {
    this.lastPauseRefreshValue = this.pauseRefresh;
    this.tryStopPolling();
  }

  restoreRefreshState() {
    this.pauseRefresh = this.lastPauseRefreshValue;
    this.tryStartPolling();
  }

  showSavedSearches() {
    this.saveRefreshState();
    this.router.navigateByUrl('/alerts-list(dialog:saved-searches)');
  }

  showSaveSearch() {
    this.saveRefreshState();
    this.saveSearchService.setQueryBuilderToSave(this.queryBuilder);
    this.router.navigateByUrl('/alerts-list(dialog:save-search)');
  }

  tryStartPolling() {
    if (!this.pauseRefresh) {
      this.refreshTimer = this.alertsService.pollSearch(this.queryBuilder).subscribe(results => {
        this.setData(results);
      });
    }
  }

  tryStopPolling() {
    if (this.refreshTimer) {
      this.refreshTimer.unsubscribe();
    }
  }

  updateSelectedAlertStatus(status: string) {
    for (let alert of this.selectedAlerts) {
      alert.status = status;
    }
  }
}
