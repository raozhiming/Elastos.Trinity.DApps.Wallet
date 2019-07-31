import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletmodePage } from './walletmode.page';

describe('WalletmodePage', () => {
  let component: WalletmodePage;
  let fixture: ComponentFixture<WalletmodePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletmodePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletmodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
