import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifywalletnamePage } from './modifywalletname.page';

describe('ModifywalletnamePage', () => {
  let component: ModifywalletnamePage;
  let fixture: ComponentFixture<ModifywalletnamePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifywalletnamePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifywalletnamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
