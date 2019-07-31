import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentConfirmPage } from './payment-confirm.page';

describe('PaymentConfirmPage', () => {
  let component: PaymentConfirmPage;
  let fixture: ComponentFixture<PaymentConfirmPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentConfirmPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentConfirmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
