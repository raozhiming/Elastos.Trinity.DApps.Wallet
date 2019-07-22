import { Component, OnInit } from '@angular/core';
import { WalletManager } from '../../services/WalletManager';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  public spvVersion = "0";
  constructor(public walletManager:WalletManager) {
        this.init();
  }

  ngOnInit() {
    console.log('ngOnInit AboutPage');
  }

  init(){
    this.walletManager.getVersion((data)=>{
      if(data['success']){
          this.spvVersion = data['success'];
      }
    });
 }

}
