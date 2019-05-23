import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentboxPage } from './paymentbox.page';

describe('PaymentboxPage', () => {
  let component: PaymentboxPage;
  let fixture: ComponentFixture<PaymentboxPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentboxPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentboxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
