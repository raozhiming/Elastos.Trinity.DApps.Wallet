import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MnemonicWritePage } from './mnemonic-write.page';

describe('MnemonicWritePage', () => {
  let component: MnemonicWritePage;
  let fixture: ComponentFixture<MnemonicWritePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MnemonicWritePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MnemonicWritePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
