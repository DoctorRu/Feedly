import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import firebase from "firebase";

@Component({
    selector: 'page-feed',
    templateUrl: 'feed.html',
})
export class FeedPage {
    
    message: string = '';
    
    constructor(public navCtrl: NavController,
                public navParams: NavParams) {
    }
    
    post() {
        firebase.firestore().collection("posts").add({
                text: this.message,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                owner: firebase.auth().currentUser.uid,
                owner_name: firebase.auth().currentUser.displayName
            })
            .then(doc => {
                console.log('created ', doc);
            })
            .catch(err => { console.log('err ', err)})
    }
}
