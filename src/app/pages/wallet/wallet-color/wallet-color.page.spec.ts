import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletColorPage } from './wallet-color.page';

describe('WalletColorPage', () => {
  let component: WalletColorPage;
  let fixture: ComponentFixture<WalletColorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletColorPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletColorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
