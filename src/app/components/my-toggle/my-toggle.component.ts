import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
    selector: 'my-toggle',
    templateUrl: './my-toggle.component.html',
    styleUrls: ['./my-toggle.component.scss'],
})
export class MyToggleComponent implements OnInit {

    constructor() { }

    @Input() checked: boolean = false;
    @Output() onChange = new EventEmitter<boolean>();

    onClick(checked) {
        this.checked = checked;
        this.onChange.emit(checked);
    }

    ngOnInit() { }
}
