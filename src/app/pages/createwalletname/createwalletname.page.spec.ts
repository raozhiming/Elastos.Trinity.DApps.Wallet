import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatewalletnamePage } from './createwalletname.page';

describe('CreatewalletnamePage', () => {
  let component: CreatewalletnamePage;
  let fixture: ComponentFixture<CreatewalletnamePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatewalletnamePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatewalletnamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
