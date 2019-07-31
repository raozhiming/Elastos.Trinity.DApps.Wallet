import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinSelectPage } from './coin-select.page';

describe('CoinSelectPage', () => {
  let component: CoinSelectPage;
  let fixture: ComponentFixture<CoinSelectPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoinSelectPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinSelectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
