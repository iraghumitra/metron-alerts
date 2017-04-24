import { Component, OnInit, ChangeDetectorRef, DoCheck } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {ConfigureTableService} from "../../service/configure-table.service";
import {SampleData} from '../../model/sample-data';

export enum AlertState {
  NEW, OPEN, ESCALATE, DISMISS, RESOLVE
}

export class ConfigureColumns {
  name: string;
  type: string;
  selected: boolean;

  constructor(colName: string, columnDataTypeMap: any){
    this.name = colName;
    this.type = columnDataTypeMap.type;
  }
}

@Component({
  selector: 'app-configure-table',
  templateUrl: './configure-table.component.html',
  styleUrls: ['./configure-table.component.scss']
})

export class ConfigureTableComponent implements OnInit {

  allColumns: ConfigureColumns[] = [];
  alertsColumnNames:string[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private configureTableService: ConfigureTableService,
              private ref: ChangeDetectorRef) { }

  getAllColumnNames() {
    let columnData = SampleData.getSnortFieldNames();
    let keys = Object.keys(columnData.mappings.snort_doc.properties);
    for(let colName of keys ) {
      this.allColumns.push(new ConfigureColumns(colName, columnData.mappings.snort_doc.properties[colName]));
    }

    this.allColumns = this.allColumns.sort((col1, col2) => { return col1.name.localeCompare(col2.name)})
  }

  getConfiguredColumns() {
    this.configureTableService.getTableColumns().subscribe((colNames: any[]) => {
      this.alertsColumnNames = colNames.map((colData) => colData['key']);
    });
  }

  goBack() {
    this.router.navigateByUrl('/alerts-list');
    return false;
  }

  ngOnInit() {
    this.getConfiguredColumns();
    this.getAllColumnNames();
  }

  onTableChanged() {
    this.configureTableService.onTableChanged();
  }

  selectColumn(columnName: string, checkbox: HTMLInputElement) {
    if (checkbox.checked) {
      this.alertsColumnNames.push(columnName);
    } else {
      let index = this.alertsColumnNames.indexOf(columnName);
      this.alertsColumnNames.splice(index, 1);
    }
  }

  swapUp(index: number) {
    if (index > 0) {
      [this.allColumns[index], this.allColumns[index-1]] = [this.allColumns[index-1], this.allColumns[index]];
    }
  }

  swapDown(index: number) {
    if (index + 1 < this.allColumns.length) {
      [this.allColumns[index], this.allColumns[index+1]] = [this.allColumns[index+1], this.allColumns[index]];
    }
  }
}


