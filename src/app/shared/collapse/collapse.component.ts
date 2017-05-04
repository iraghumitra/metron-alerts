import { Component, OnInit, Input } from '@angular/core';
import 'bootstrap';

export interface CollapseComponentData {
  getName(): string;
  getBuckets(): any[];
}

@Component({
  selector: 'metron-collapse',
  templateUrl: './collapse.component.html',
  styleUrls: ['./collapse.component.scss']
})
export class CollapseComponent implements OnInit {

  @Input() data: any;
  static counter = 0;
  uniqueId: string = '';

  constructor() {
    this.uniqueId = 'CollapseComponent' + '_' + ++CollapseComponent.counter;
  }

  ngOnInit() {
  }

}
