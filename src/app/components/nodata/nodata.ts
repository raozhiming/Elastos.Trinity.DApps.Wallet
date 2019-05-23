import { Component, Input, OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
/**
 * Generated class for the NodataComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'nodata',
  templateUrl: 'nodata.html'
})
export class NodataComponent implements OnInit{
  @Input()
  keyText: string = "";
  text: string;

  constructor(private translate: TranslateService) {

  }

  ngOnInit() {
    this.text = this.translate.instant(this.keyText);
  }



}
