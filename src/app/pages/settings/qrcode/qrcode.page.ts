import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import QRCode from 'easyqrcodejs';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.page.html',
  styleUrls: ['./qrcode.page.scss'],
})
export class QrcodePage implements OnInit {

  @ViewChild('qrcode', { static: false }) qrcode: ElementRef; // <HTMLCanvasElement>;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;

  public qrcodeImg: any;

  constructor() { }

  ngOnInit() {
    this.createQrCode();
  }

  createQrCode() {
    // Options
    const options = {
        // Basic
        text: "apples and oranges",
        width: 250,
        height: 250,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.Q,
        // QR Styling
        dotScale: 1,
        PO: 'rgb(25, 26, 47)',
        // Background Img
        backgroundImage: '/assets/icons/elastos.svg',
        backgroundImageAlpha: 0.5,
        // Title
        title: 'Your Decentralized ID',
        titleColor: '#000',
        titleFont: "bold 20px Montserrat",
        titleTop: -10,
        // titleBackgroundColor: '#dddddd',
        // Subtitle
        subTitle: 'did:elastos123456789',
        subTitleFont: "16px Montserrat",
        subTitleColor: "#000",
        subTitleTop: 285,
        // Outer Zone
        quietZone: 40,
        quietZoneColor: 'transparent',
    };

    setTimeout(() => {
        new QRCode(this.qrcode.nativeElement, options);

        html2canvas(this.qrcode.nativeElement).then(canvas => {
            this.qrcodeImg = canvas.toDataURL("image/png");
            this.canvas.nativeElement.src = canvas.toDataURL();
            console.log('QRCODE IMG', this.qrcodeImg);
        });
    }, 1000);
  }

}
