import { Component, OnInit, ViewChild, ElementRef, NgZone, ViewEncapsulation } from '@angular/core';
import QRCode from 'easyqrcodejs';
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.page.html',
  styleUrls: ['./qrcode.page.scss'],
  //encapsulation: ViewEncapsulation.None
})
export class QrcodePage implements OnInit {

  @ViewChild('qrcode', { static: false }) qrcode: ElementRef; // <HTMLCanvasElement>;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;

  public qrcodeImg: string;

  constructor(private zone: NgZone) { }

  ngOnInit() {
    this.createQrCode();
  }

  createQrCode() {
    let didString = "did:elastos:insTmxdDDuS9wHHfeYD1h5C2onEHh3D8Vq";
    let didMnemonic = "jewel proud hero asthma drop tobacco drama borrow decrease hidden chalk raw";

    // Options
    const options = {
        // Basic
        text: didMnemonic,
        width: 250,
        height: 250,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.Q,
        // QR Styling
        dotScale: 1,
        PO: 'rgb(25, 26, 47)',
        // Background Img
        logo: '/assets/icons/elastos.svg',
        backgroundImageAlpha: 0.5,
        // Title
        title: 'Your Decentralized ID',
        titleColor: '#000',
        titleFont: "bold 20px Montserrat",
        titleTop: -10,
        // titleBackgroundColor: '#dddddd',
        // Subtitle
        subTitle: didString,
        subTitleFont: "12px Montserrat",
        subTitleColor: "#000",
        subTitleTop: 285,
        // Outer Zone
        quietZone: 40,
        quietZoneColor: 'transparent',
    };

    try {
      setTimeout(() => {
        //let testDOM = document.createElement("div");
        new QRCode(this.qrcode.nativeElement, options);
        //new QRCode(testDOM, options);

        /*
        const element = document.getElementById('html2canvas');
        this.html2canvas.html2canvas(element.firstChild).then((img) => {
            this.img = img;
            element.firstChild.remove();
        }).catch((res) => {
            console.log(res);
        });
        */

       //const targetElement = this.qrcode.nativeElement; //document.createElement("div");
       //document.body.appendChild(targetElement);

       //document.getElementById("body").appendChild(targetElement);

        try {
          let convertedEl = this.qrcode.nativeElement as HTMLElement;

          console.log("Converted element", convertedEl);
          console.log("children", this.qrcode.nativeElement.children)
         // console.log("stylesheets", convertedEl.shadowRoot.styleSheets);

         if (convertedEl.children && convertedEl.children.length > 1 && convertedEl.children[1] instanceof HTMLImageElement) {
           let generatedImgDom = (convertedEl.children[1] as HTMLImageElement);
           generatedImgDom.onload = () => {
            console.log("DATA:", generatedImgDom.src);
            this.qrcodeImg = generatedImgDom.src;
           }
         }

          /*domtoimage.toPng(convertedEl).then((dataUrl) => {
              console.log("IMAGE GENERATED", dataUrl)

              this.zone.run(()=>{
                console.log("IN RUN")

                //this.qrcodeImg = dataUrl;//canvas.toDataURL("image/png");
                //this.canvas["src"] = canvas.toDataURL();
                //console.log('QRCODE IMG', this.qrcodeImg);
                //document.lastElementChild.remove();
              });
            }).catch((e)=>{
              console.warn("TOPNG EXCEPTION:", e);
            });*/

         /* html2canvas(convertedEl, {
            foreignObjectRendering: false
          }).then(canvas => {
            this.zone.run(()=>{
              console.log("CANVAS GENERATED")
              this.qrcodeImg = canvas.toDataURL("image/png");
              //this.canvas["src"] = canvas.toDataURL();
              //console.log('QRCODE IMG', this.qrcodeImg);
              document.lastElementChild.remove();
            });
          }).catch(e => {
            console.warn("Exception (2) in html2canvas", e);
          });*/
        }
        catch (e) {
          console.warn("Exception in html2canvas", e);
        }
      }, 1000);
    }
    catch (e) {
      console.warn("Exception in setTimeout", e);
    }
  }
}
