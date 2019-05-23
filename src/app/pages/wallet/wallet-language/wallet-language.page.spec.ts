import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletLanguagePage } from './wallet-language.page';

describe('WalletLanguagePage', () => {
  let component: WalletLanguagePage;
  let fixture: ComponentFixture<WalletLanguagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletLanguagePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletLanguagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
