import {Component} from '@angular/core';
import {NavController, ToastController} from 'ionic-angular';
import firebase from 'firebase';

import {SignupPage} from "../signup/signup";
import {FeedPage} from "../feed/feed";


@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})
export class LoginPage {
    
    email: string = '';
    password: string = '';
    
    constructor(public navCtrl: NavController,
                public toastCtrl: ToastController) {
        
    }
    
    gotoSignUp() {
        this.navCtrl.push(SignupPage);
    }
    
    
    login() {
        firebase.auth().signInWithEmailAndPassword(this.email, this.password)
            .then(res => {
                this.toastCtrl.create({
                        message: 'Welcome ' + res.user.displayName,
                        duration: 3000
                    })
                    .present();
                
                this.navCtrl.setRoot(FeedPage);
            })
            .catch(err => {
                this.toastCtrl.create({
                        message: err.message,
                        duration: 3000
                    })
                    .present();
            });
    }
}
    












