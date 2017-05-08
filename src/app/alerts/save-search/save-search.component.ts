import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import {SaveSearchService} from '../../service/save-search.service';
import {SaveSearch} from '../../model/save-search';

@Component({
  selector: 'app-save-search',
  templateUrl: './save-search.component.html',
  styleUrls: ['./save-search.component.scss']
})
export class SaveSearchComponent implements OnInit {

  saveSearch = new SaveSearch();

  constructor(private router: Router,
              private saveSearchService: SaveSearchService) {
  }

  ngOnInit() {
  }

  goBack() {
    this.router.navigateByUrl('/alerts-list');
    return false;
  }

  save() {
    this.saveSearch.queryBuilder = this.saveSearchService.queryBuilder;

    this.saveSearchService.saveSearch(this.saveSearch).subscribe(() => {
      this.goBack();
    }, error => {
    });
  }

}
