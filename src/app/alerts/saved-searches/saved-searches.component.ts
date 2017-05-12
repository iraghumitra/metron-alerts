import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import {SaveSearchService} from '../../service/save-search.service';
import {SaveSearch} from '../../model/save-search';
import {QueryBuilder} from '../../model/query-builder';
import {MetronDialogBox} from '../../shared/metron-dialog-box';


@Component({
  selector: 'app-saved-searches',
  templateUrl: './saved-searches.component.html',
  styleUrls: ['./saved-searches.component.scss']
})
export class SavedSearchesComponent implements OnInit {

  searches: SaveSearch[];
  savedSearches: any = {};
  recentSearches: any = {};
  constructor(private router: Router,
              private saveSearchService: SaveSearchService,
              private metronDialog: MetronDialogBox) {
  }

  doDeleteSearch(selectedSearch: any|SaveSearch) {
    this.saveSearchService.deleteSearch(selectedSearch).subscribe(() => {
      this.ngOnInit();
    },
    error => {
      this.ngOnInit();
    });
  }

  deleteSearch($event) {
    let selectedSearch = this.searches.find(savedSearch => savedSearch.name === $event.key);
    this.metronDialog.showConfirmationMessage('Do you wish to delete saved search ' + selectedSearch.name).subscribe((result: boolean) => {
      if (result) {
        this.doDeleteSearch(selectedSearch);
      }
    });
  }

  ngOnInit() {
    this.saveSearchService.listSavedSearches().subscribe((savedSearches: SaveSearch[]) => {
      this.prepareData(savedSearches);
    });
  }

  prepareData(savedSearches: SaveSearch[]) {
    savedSearches = savedSearches || [];
    this.preparedSavedSearches(savedSearches);
    this.preparedRecentlyAccessedSearches(savedSearches);

    this.searches = savedSearches;
  }

  preparedRecentlyAccessedSearches(savedSearches: SaveSearch[]) {
    let recentSearchNames = savedSearches.sort((s1, s2) => { return s2.lastAccessed - s1.lastAccessed; }).slice(0, 5)
                          .map(search => { return {key: search.name}; });

    this.recentSearches = {
      getName: () => {
        return 'Recent Searches';
      },
      getData: () => {
        return recentSearchNames;
      },
    };
  }

  preparedSavedSearches(savedSearches: SaveSearch[]) {
    let savedSearchNames = savedSearches.map(savedSearch => { return {key: savedSearch.name}; });

    this.savedSearches = {
      getName: () => {
        return 'Saved Searches';
      },
      getData: () => {
        return savedSearchNames;
      },
    };
  }

  goBack() {
    this.router.navigateByUrl('/alerts-list');
    return false;
  }

  updateSearch($event) {
    let selectedSearch = this.searches.find(savedSearch => savedSearch.name === $event.key);
    selectedSearch.lastAccessed = new Date().getTime();
    this.saveSearchService.updateSearch(selectedSearch).subscribe(() => {
      this.saveSearchService.fireLoadSavedSearch(QueryBuilder.fromJSON(selectedSearch.queryBuilder));
      this.goBack();
    }, error => {
      this.saveSearchService.fireLoadSavedSearch(QueryBuilder.fromJSON(selectedSearch.queryBuilder));
      this.goBack();
    });
  }
}
