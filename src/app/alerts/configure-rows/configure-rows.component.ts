import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import {PageSize, RefreshInterval} from './configure-rows-enums';

@Component({
  selector: 'app-configure-rows',
  templateUrl: './configure-rows.component.html',
  styleUrls: ['./configure-rows.component.scss']
})
export class ConfigureRowsComponent implements OnInit {

  pageSize = PageSize;
  show = false;
  sizeInternal: number = PageSize.TWENTY_FIVE;
  intervalInternal = RefreshInterval.ONE_MIN;
  @Input() srcElement: HTMLElement;
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
      this.show = !this.show;
      return;
    }

    const clickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.show = false;
    }
  }

  onPageSizeChange($event, parentElement) {
    parentElement.querySelector('.is-active').classList.remove('is-active');
    $event.target.classList.add('is-active');
  }

  onRefreshIntervalChange($event, parentElement) {
    parentElement.querySelector('.is-active').classList.remove('is-active');
    $event.target.classList.add('is-active');
  }
}
