import { Component, OnInit, Input, HostListener, ElementRef, Output, EventEmitter } from '@angular/core';
import {PageSize, RefreshInterval} from './configure-rows-enums';

@Component({
  selector: 'app-configure-rows',
  templateUrl: './configure-rows.component.html',
  styleUrls: ['./configure-rows.component.scss']
})
export class ConfigureRowsComponent implements OnInit {

  showView = false;
  pageSize = PageSize;
  sizeInternal: number = PageSize.TWENTY_FIVE;
  intervalInternal = RefreshInterval.ONE_MIN;

  @Input() srcElement: HTMLElement;
  @Output() sizeChange = new EventEmitter();
  @Output() intervalChange = new EventEmitter();
  @Output() configRowsChange = new EventEmitter();

  constructor(private elementRef: ElementRef) {}

  @Input()
  get size() {
    return this.sizeInternal;
  }

  set size(val) {
    this.sizeInternal = val;
  }

  @Input()
  get interval() {
    return this.intervalInternal;
  }

  set interval(val) {
    this.intervalInternal = val;
  }

  ngOnInit() {
  }

  @HostListener('document:click', ['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: HTMLElement): void {
    if (!targetElement) {
      return;
    }

    if (targetElement.contains(this.srcElement)) {
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

    this.size = parseInt($event.target.textContent.trim());
    this.sizeChange.emit(this.sizeInternal);
    this.configRowsChange.emit();
  }

  onRefreshIntervalChange($event, parentElement) {
    parentElement.querySelector('.is-active').classList.remove('is-active');
    $event.target.classList.add('is-active');

    this.interval = parseInt($event.target.getAttribute('value').trim());
    this.intervalChange.emit(this.intervalInternal);
    this.configRowsChange.emit();
  }
}
