import { Pipe, PipeTransform } from '@angular/core';

const limit = 12;

@Pipe({
  name: 'centerEllipses'
})
export class CenterEllipsesPipe implements PipeTransform {
  private trail = '...';


  transform(value: any, domElement: any): any {
      let tLimit = limit;
      if (domElement && domElement.offsetWidth ) {
        tLimit = Math.floor(domElement.offsetWidth/10);
      }

      return value.length > tLimit
        ? value.substring(0, tLimit/2) + this.trail + value.substring(value.length - tLimit/2, value.length)
        : value;
  }

}
