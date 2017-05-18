import { Component, Input, HostListener, ElementRef, Output, EventEmitter } from '@angular/core';
import {TableMetadata} from '../../model/table-metadata';
import {ConfigureTableService} from '../../service/configure-table.service';

@Component({
  selector: 'app-configure-rows',
  templateUrl: './configure-rows.component.html',
  styleUrls: ['./configure-rows.component.scss']
})
export class ConfigureRowsComponent  {

  showView = false;
  tableMetadata = new TableMetadata();

  @Input() srcElement: HTMLElement;
  @Output() sizeChange = new EventEmitter();
  @Output() intervalChange = new EventEmitter();
  @Output() configRowsChange = new EventEmitter();

  constructor(private elementRef: ElementRef,
              private configureTableService: ConfigureTableService) {}

  @Input()
  get size() {
    return this.tableMetadata.size;
  }

  set size(val) {
    this.tableMetadata.size = val;
  }

  @Input()
  get interval() {
    return this.tableMetadata.refreshInterval;
  }

  set interval(val) {
    this.tableMetadata.refreshInterval = val;
  }

  @Input()
  get tableMetaData() {
    return this.tableMetadata;
  }

  set tableMetaData(val) {
    this.tableMetadata = val;
  }

  @HostListener('document:click', ['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: HTMLElement): void {
    if (!targetElement) {
      return;
    }

    if (targetElement === this.srcElement) {
      this.showView = !this.showView;
      return;
    }

    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.showView = false;
    }
  }

  onPageSizeChange($event, parentElement) {
    parentElement.querySelector('.is-active').classList.remove('is-active');
    $event.target.classList.add('is-active');

    this.size = parseInt($event.target.textContent.trim(), 10);
    this.sizeChange.emit(this.tableMetadata.size);
    this.configRowsChange.emit();
    this.saveSettings();
  }
  onRefreshIntervalChange($event, parentElement) {
    parentElement.querySelector('.is-active').classList.remove('is-active');
    $event.target.classList.add('is-active');


    this.interval = parseInt($event.target.getAttribute('value').trim(), 10);
    this.intervalChange.emit(this.tableMetadata.refreshInterval);
    this.configRowsChange.emit();
    this.saveSettings();
  }

  saveSettings() {
    if ( this.showView ) {
      this.configureTableService.saveTableMetaData(this.tableMetadata).subscribe(() => {
      }, error => {
        console.log('Unable to save settings ....');
      });
    }
  }
}
