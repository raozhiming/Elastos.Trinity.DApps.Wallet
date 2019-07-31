import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddpublickeyPage } from './addpublickey.page';

describe('AddpublickeyPage', () => {
  let component: AddpublickeyPage;
  let fixture: ComponentFixture<AddpublickeyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddpublickeyPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddpublickeyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
