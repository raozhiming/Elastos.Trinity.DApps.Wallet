import { NgModule } from '@angular/core';
import { ProgressBarComponent } from './progress-bar/progress-bar';
import { CommonModule } from '@angular/common';
import { NodataComponent } from './nodata/nodata';
@NgModule({
	declarations: [ProgressBarComponent,
    NodataComponent],
	imports: [CommonModule],
	exports: [ProgressBarComponent,
    NodataComponent]
})
export class ComponentsModule {}
