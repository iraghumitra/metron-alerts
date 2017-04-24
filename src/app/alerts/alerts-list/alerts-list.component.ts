import { Component, OnInit } from '@angular/core';
import {Router, NavigationStart} from '@angular/router';

import {Alert} from '../../model/alert';
import {AlertService} from '../../service/alert.service';
import {SearchRequest} from "../../model/search-request";
import {Filter} from "../../model/filter";
import {ConfigureTableService} from "../../service/configure-table.service";
import {WorkflowService} from "../../service/workflow.service";
import {SampleData} from '../../model/sample-data';

const defaultPaginationParams = {start: 0, end: 15, total: 0};

@Component({
  selector: 'app-alerts-list',
  templateUrl: './alerts-list.component.html',
  styleUrls: ['./alerts-list.component.scss']
})
export class AlertsListComponent implements OnInit {

  selectedAlerts: Alert[] = [];
  alerts: Alert[] = [];
  alertsColumnNames:any[] = [];

  paginationParams = defaultPaginationParams;
  searchRequest: SearchRequest = { query: { query_string: { query: '*'} }, from: this.paginationParams.start, size: this.paginationParams.end, sort: [{ timestamp: {order : 'desc', ignore_unmapped: true} }], aggs: {}};
  filters: Filter[] = [];

  showConfigureTable: boolean = false;
  hideGroup: boolean = false;
  
  /* Sample Data */
  filtersData = SampleData.getFilters();

  constructor(private router: Router, private alertsService: AlertService, private configureTableService: ConfigureTableService, private workflowService: WorkflowService) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart && event.url === '/alerts-list') {
        this.selectedAlerts = [];
      }
    });
  }

  ngOnInit() {
    this.search();

    this.configureTableService.getTableColumns().subscribe((colNames: any[]) => {
      this.alertsColumnNames = colNames;
    });

    this.configureTableService.tableChanged$.subscribe(results => {
      console.log(results);
    })
  }

  onSearch(resetPaginationParams: boolean = true) {
    this.updateFilters();
    this.search(resetPaginationParams);
  }

  onAddFilter(field: string, value: string) {
    this.addFilter(field, value);
    this.generateQuery();
    this.search(true);
  }

  selectAllRows($event) {
    this.selectedAlerts = [];
    if ($event.target.checked) {
      this.selectedAlerts = this.alerts;
    }
  }

  mockSearch() {
    this.selectedAlerts = [];
    this.alertsService.mockSearch().subscribe(results => {
      this.alerts = results;
    });
  }

  search(resetPaginationParams: boolean = true) {
    this.selectedAlerts = [];

    if (resetPaginationParams) {
      this.paginationParams = {start: 0, end: 15, total: 0};
    }

    this.alertsService.search(this.searchRequest).subscribe(results => {
      let alertResults = [];
      for(let hit of results['hits'].hits) {
        alertResults.push(new Alert(85,  'description', hit['_id'], hit['_source']['timestamp'], hit['_source']['source:type'],
          hit['_source']['ip_src_addr'], 'Los Angeles, CA USA', hit['_source']['ip_dst_addr'], 'x230-12811', hit['_source']['alert_status'], hit['_index'], hit['_type'], hit['_source']));
      }
      this.alerts = alertResults;
      this.paginationParams.total = results['hits'].total;
    });
  }

  selectRow($event, alert: Alert) {
    if ($event.target.checked) {
      this.showConfigureTable = true;
      this.selectedAlerts.push(alert);
    } else {
      this.selectedAlerts.splice(this.selectedAlerts.indexOf(alert), 1);
    }
  }

  showDetails($event, alert: Alert) {
    if ($event.target.type !== 'checkbox' && $event.target.parentElement.firstChild.type !== 'checkbox' && $event.target.nodeName !== 'A') {
      this.selectedAlerts = [];
      this.selectedAlerts = [alert];
      this.router.navigateByUrl('/alerts-list(dialog:details/' + alert._index + '/' + alert._type + '/' + alert.alertId + ')');
    }
  }

  processEscalate() {
    this.workflowService.start(this.selectedAlerts).subscribe(workflowId => {
      this.alertsService.updateAlertState(this.selectedAlerts, 'ESCALATE', workflowId).subscribe(results => {
        this.updateSelectedAlertStatus('ESCALATE');
        console.log(results);
      });
    });
  }

  processDismiss() {
    this.alertsService.updateAlertState(this.selectedAlerts, 'DISMISS', '').subscribe(results => {
      this.updateSelectedAlertStatus('DISMISS');
      console.log(results);
    });
  }

  processOpen() {
    this.alertsService.updateAlertState(this.selectedAlerts, 'OPEN', '').subscribe(results => {
      this.updateSelectedAlertStatus('OPEN');
      console.log(results);
    });
  }

  processResolve() {
    this.alertsService.updateAlertState(this.selectedAlerts, 'RESOLVE', '').subscribe(results => {
      this.updateSelectedAlertStatus('RESOLVE');
      console.log(results);
    });
  }

  updateSelectedAlertStatus(status: string) {
    for (let alert of this.selectedAlerts) {
      alert.status = status;
    }
  }

  addFilter(field: string, value: string) {
    let filter = this.filters.find(filter => filter.field === field);
    if (filter) {
      filter.value = value;
    } else {
      this.filters.push(new Filter(field, value));
    }
  }

  removeFilter(field: string) {
    let filter = this.filters.find(filter => filter.field === field);
    this.filters.splice(this.filters.indexOf(filter), 1);
    this.generateQuery();
    this.search();
  }

  generateQuery() {
    this.searchRequest.query['query_string'].query = this.filters.map(filter => filter.field.replace(':', '\\:') + ':' + filter.value).join(' AND ');
    if (this.searchRequest.query['query_string'].query.length === 0) {
      this.searchRequest.query['query_string'].query = '*';
    }
  }

  updateFilters() {
    let query = this.searchRequest.query['query_string'].query;
    this.searchRequest.from = this.paginationParams.start;
    this.filters = [];

    if (query && query !== '' && query !== '*') {
      let terms = query.split(' AND ');
      for (let term of terms) {
        let separatorPos = term.lastIndexOf(':');
        let field = term.substring(0, separatorPos).replace('\\', '');
        let value = term.substring(separatorPos + 1, term.length);
        this.addFilter(field, value);
      }
    }
  }
  
  configureTable() {
    this.router.navigateByUrl('/alerts-list(dialog:configure-table)');
  }

  getCollapseComponentData(data: any) {
    return {
      getName: () => {
        return Object.keys(data.aggregations)[0];
      },
      getData: () => {
        return data.aggregations[Object.keys(data.aggregations)[0]].buckets;
      },
    }
  }
}
