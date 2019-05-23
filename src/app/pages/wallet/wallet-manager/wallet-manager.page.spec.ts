import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletManagerPage } from './wallet-manager.page';

describe('WalletManagerPage', () => {
  let component: WalletManagerPage;
  let fixture: ComponentFixture<WalletManagerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletManagerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletManagerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
