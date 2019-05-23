import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublickeyPage } from './publickey.page';

describe('PublickeyPage', () => {
  let component: PublickeyPage;
  let fixture: ComponentFixture<PublickeyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublickeyPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublickeyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
