import {Component} from '@angular/core';
import {AlertController, NavController, NavParams, ToastController} from 'ionic-angular';
import firebase from 'firebase';

import {FeedPage} from "../feed/feed";

@Component({
    selector: 'page-signup',
    templateUrl: 'signup.html',
})
export class SignupPage {
    
    name: string = '';
    email: string = '';
    password: string = '';
    
    
    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public toastCtrl: ToastController,
                public alertCtrl: AlertController) {
    }
    
    signup() {
        firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
            .then(data => {
                console.log(data);
                
                let newUser: firebase.User = data.user;
                
                newUser.updateProfile({
                        displayName: this.name,
                        photoURL: ""
                    })
                    .then(res => {
                        this.alertCtrl.create({
                                title: 'Account Created',
                                message: 'Your account has been created successfully.',
                                buttons: [
                                    {
                                        text: 'OK',
                                        handler: () => {
                                        }
                                    }
                                ]
                            })
                            .present();
                        
                        this.navCtrl.setRoot(FeedPage)
                        
                    })
                    .catch(err => {
                        this.toastCtrl.create({
                                message: err.message,
                                duration: 3000
                            })
                            .present();
                    })
                
            })
            .catch(err => {
                this.toastCtrl.create({
                        message: err.message,
                        duration: 3000
                    })
                    .present();
            })
    }
    
    
    goBack() {
        this.navCtrl.pop()
    }
}
