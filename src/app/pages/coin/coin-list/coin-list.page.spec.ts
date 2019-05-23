import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinListPage } from './coin-list.page';

describe('CoinListPage', () => {
  let component: CoinListPage;
  let fixture: ComponentFixture<CoinListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoinListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
