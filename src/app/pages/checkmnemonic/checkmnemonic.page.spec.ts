import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckmnemonicPage } from './checkmnemonic.page';

describe('CheckmnemonicPage', () => {
  let component: CheckmnemonicPage;
  let fixture: ComponentFixture<CheckmnemonicPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckmnemonicPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckmnemonicPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
