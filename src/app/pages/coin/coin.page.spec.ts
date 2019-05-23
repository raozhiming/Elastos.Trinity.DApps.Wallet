import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinPage } from './coin.page';

describe('CoinPage', () => {
  let component: CoinPage;
  let fixture: ComponentFixture<CoinPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoinPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
