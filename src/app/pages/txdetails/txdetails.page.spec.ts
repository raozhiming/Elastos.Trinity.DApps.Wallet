import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TxdetailsPage } from './txdetails.page';

describe('TxdetailsPage', () => {
  let component: TxdetailsPage;
  let fixture: ComponentFixture<TxdetailsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TxdetailsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TxdetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
