import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddprivatekeyPage } from './addprivatekey.page';

describe('AddprivatekeyPage', () => {
  let component: AddprivatekeyPage;
  let fixture: ComponentFixture<AddprivatekeyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddprivatekeyPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddprivatekeyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
