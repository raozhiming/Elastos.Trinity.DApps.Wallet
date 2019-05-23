import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabSettingPage } from './tab-setting.page';

describe('TabSettingPage', () => {
  let component: TabSettingPage;
  let fixture: ComponentFixture<TabSettingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabSettingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
