import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialLog } from './material-log';

describe('MaterialLog', () => {
  let component: MaterialLog;
  let fixture: ComponentFixture<MaterialLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialLog],
    }).compileComponents();

    fixture = TestBed.createComponent(MaterialLog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
