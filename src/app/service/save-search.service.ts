import {Injectable, Inject, } from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Http} from '@angular/http';
import {Subject} from 'rxjs/Subject';

import {IAppConfig} from '../app.config.interface';
import {APP_CONFIG} from '../app.config';
import {ALERTS_SAVED_SEARCH} from '../utils/constants';
import {QueryBuilder} from '../model/query-builder';
import {SaveSearch} from '../model/save-search';
import {ColumnMetadata} from '../model/column-metadata';

@Injectable()
export class SaveSearchService {

  queryBuilder: QueryBuilder;
  tableColumns: ColumnMetadata[];

  private loadSavedSearch = new Subject<SaveSearch>();
  loadSavedSearch$ = this.loadSavedSearch.asObservable();
  defaultHeaders = {'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest'};

  constructor(private http: Http, @Inject(APP_CONFIG) private config: IAppConfig) {
  }

  deleteSearch(saveSearch: SaveSearch): Observable<{}> {
    return Observable.create(observer => {
      let savedSearches: SaveSearch[] = [];
      try {
        savedSearches = JSON.parse(localStorage.getItem(ALERTS_SAVED_SEARCH));
        savedSearches = savedSearches.filter(search => search.name !== saveSearch.name);
      } catch (e) {}

      localStorage.setItem(ALERTS_SAVED_SEARCH, JSON.stringify(savedSearches));

      observer.next({});
      observer.complete();

    });
  }

  fireLoadSavedSearch(savedSearch: SaveSearch) {
    this.loadSavedSearch.next(savedSearch);
  }

  listSavedSearches(): Observable<SaveSearch[]> {
    return Observable.create(observer => {
      let savedSearches: SaveSearch[] = [];
      try {
        savedSearches = JSON.parse(localStorage.getItem(ALERTS_SAVED_SEARCH));
      } catch (e) {}

      observer.next(savedSearches);
      observer.complete();

    });
  }

  saveSearch(saveSearch: SaveSearch): Observable<{}> {
    return Observable.create(observer => {
      let savedSearches: SaveSearch[] = [];
      try {
        savedSearches = JSON.parse(localStorage.getItem(ALERTS_SAVED_SEARCH));
      } catch (e) {}

      savedSearches = savedSearches || [];
      savedSearches.push(saveSearch);
      localStorage.setItem(ALERTS_SAVED_SEARCH, JSON.stringify(savedSearches));

      observer.next({});
      observer.complete();

    });
  }

  setCurrentQueryBuilderAndTableColumns(queryBuilder: QueryBuilder, tableColumns: ColumnMetadata[]) {
    this.queryBuilder = queryBuilder;
    this.tableColumns = tableColumns;
  }

  updateSearch(saveSearch: SaveSearch): Observable<{}> {
    return Observable.create(observer => {
      let savedSearches: SaveSearch[] = [];
      try {
        savedSearches = JSON.parse(localStorage.getItem(ALERTS_SAVED_SEARCH));
        let savedItem = savedSearches.find(search => search.name === saveSearch.name);
        savedItem.lastAccessed = saveSearch.lastAccessed;
        savedItem.queryBuilder = saveSearch.queryBuilder;
      } catch (e) {}

      localStorage.setItem(ALERTS_SAVED_SEARCH, JSON.stringify(savedSearches));

      observer.next({});
      observer.complete();

    });
  }
}
