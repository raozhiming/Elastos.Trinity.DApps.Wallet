import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletSettingPage } from './wallet-setting.page';

describe('WalletSettingPage', () => {
  let component: WalletSettingPage;
  let fixture: ComponentFixture<WalletSettingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletSettingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
