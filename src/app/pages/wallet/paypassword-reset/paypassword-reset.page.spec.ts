import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaypasswordResetPage } from './paypassword-reset.page';

describe('PaypasswordResetPage', () => {
  let component: PaypasswordResetPage;
  let fixture: ComponentFixture<PaypasswordResetPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaypasswordResetPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaypasswordResetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
