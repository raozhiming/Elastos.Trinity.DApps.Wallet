import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletCreatedComponent } from './wallet-created.component';

describe('WalletCreatedComponent', () => {
  let component: WalletCreatedComponent;
  let fixture: ComponentFixture<WalletCreatedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletCreatedComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletCreatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
