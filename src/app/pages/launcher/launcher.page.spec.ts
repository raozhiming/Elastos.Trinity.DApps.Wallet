import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LauncherPage } from './launcher.page';

describe('LauncherPage', () => {
  let component: LauncherPage;
  let fixture: ComponentFixture<LauncherPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LauncherPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LauncherPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
