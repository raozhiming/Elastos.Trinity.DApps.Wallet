import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletlistPage } from './walletlist.page';

describe('WalletlistPage', () => {
  let component: WalletlistPage;
  let fixture: ComponentFixture<WalletlistPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletlistPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletlistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
