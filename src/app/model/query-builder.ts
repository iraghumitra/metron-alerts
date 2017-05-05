import {Filter} from './filter';
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export class QueryBuilder {
  private _query: string = '*';
  private from: number = 0;
  private size: number = 15;
  private sort: {}[] = [{ timestamp: {order : 'desc', ignore_unmapped: true, unmapped_type: "date"} }];
  private aggs: {};
  private _filters: Filter[] = [];

  set query(value:string) {
    this._query = value;
    this.updateFilters();
    this.onSearchChange();
  }

  get query():string {
    return this._query;
  }

  get filters():Filter[] {
    return this._filters;
  }

  addOrUpdateFilter(field: string, value: string) {
    let filter = this._filters.find(filter => filter.field === field);
    if (filter) {
      filter.value = value;
    } else {
      this._filters.push(new Filter(field, value));
    }

    this.onSearchChange();
  }

  generateSelect() {
    let select = this._filters.map(filter => filter.field.replace(/:/g, '\\:') + ':' + filter.value).join(' AND ');
    return (select.length === 0) ? '*' : select;
  }

  getESSearchQuery() {
    return {
      query: { query_string: { query: this.generateSelect() } },
      from: this.from,
      size: this.size,
      sort: this.sort,
      aggs: {}
    };
  }

  onSearchChange() {
    this._query = this.generateSelect();
  }

  removeFilter(field: string) {
    let filter = this._filters.find(filter => filter.field === field);
    this._filters.splice(this._filters.indexOf(filter), 1);

    this.onSearchChange();
  }

  setAggregations(value: any) {
    this.aggs = value;
  }

  setFromAndSize(from:number, size:number) {
    this.from = from;
    this.size = size;
  }

  setSort(sortBy: string, order: string, dataType: string) {
    let sortQuery = {};
    sortQuery[sortBy] = {
      order: order,
      ignore_unmapped: true,
      unmapped_type: dataType,
      missing: "_last"
    };
    this.sort = [sortQuery];
  }

  private updateFilters() {
    let query = this._query;
    this._filters = [];

    if (query && query !== '' && query !== '*') {
      let terms = query.split(' AND ');
      for (let term of terms) {
        let separatorPos = term.lastIndexOf(':');
        let field = term.substring(0, separatorPos).replace('\\', '');
        let value = term.substring(separatorPos + 1, term.length);
        this.addOrUpdateFilter(field, value);
      }
    }
  }
}
