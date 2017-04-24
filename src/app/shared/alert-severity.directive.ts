import { Directive, ElementRef, OnChanges, SimpleChanges, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appAlertSeverity]'
})
export class AlertSeverityDirective implements OnInit, OnChanges{

  @Input('appAlertSeverity') severityBorder: number;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    this.setBorder(this.severityBorder);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['severityBorder'] && changes['severityBorder'].currentValue) {
      this.setBorder(this.severityBorder);
    }
  }

  private setBorder(severity: number) {

    if( severity > 69 ) {
      this.el.nativeElement.style.borderLeft = '4px solid #D60A15';
      this.el.nativeElement.style.paddingLeft = '10px';
    } else if( severity > 39 ) {
      this.el.nativeElement.style.borderLeft = '4px solid #D6711D';
      this.el.nativeElement.style.paddingLeft = '10px';
    } else  {
      this.el.nativeElement.style.borderLeft = '4px solid #AC9B5A';
      this.el.nativeElement.style.paddingLeft = '10px';
    }
  }

}
