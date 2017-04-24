import { NgModule } from '@angular/core';
import {routing} from './configure-table.routing';
import {SharedModule} from '../../shared/shared.module';
import {ConfigureTableComponent} from "./configure-table.component";

@NgModule ({
    imports: [ routing,  SharedModule],
    declarations: [ ConfigureTableComponent ]
})
export class ConfigureTableModule { }
