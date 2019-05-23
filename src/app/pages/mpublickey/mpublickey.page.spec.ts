import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MpublickeyPage } from './mpublickey.page';

describe('MpublickeyPage', () => {
  let component: MpublickeyPage;
  let fixture: ComponentFixture<MpublickeyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MpublickeyPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MpublickeyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
