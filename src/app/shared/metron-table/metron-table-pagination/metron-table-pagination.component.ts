import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'metron-table-pagination',
  templateUrl: './metron-table-pagination.component.html',
  styleUrls: ['./metron-table-pagination.component.scss']
})
export class MetronTablePaginationComponent  {

  @Input() total: number;
  
  @Output() startChange = new EventEmitter();
  @Output() endChange = new EventEmitter();
  @Output() next = new EventEmitter();
  @Output() previous = new EventEmitter();

  startValue: number;
  endValue: number;

  @Input()
  get start() {
    return this.startValue;
  }

  set start(val) {
    this.startValue = val;
  }

  @Input()
  get end() {
    return this.endValue;
  }

  set end(val) {
    this.endValue = val;
  }

  onPrevious() {
    let size = this.endValue-this.startValue;
    this.start -= size;
    this.end -= size;

    this.startChange.emit(this.startValue);
    this.endChange.emit(this.endValue);

    this.next.emit();
  }

  onNext() {
    let size = this.endValue-this.startValue;
    this.start  += size;
    this.end  += size;

    this.startChange.emit(this.startValue);
    this.endChange.emit(this.endValue);

    this.previous.emit();
  }
}
