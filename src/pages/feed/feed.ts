import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import firebase from "firebase";
import moment from "moment";

@Component({
    selector: 'page-feed',
    templateUrl: 'feed.html',
})
export class FeedPage {
    
    message: string = '';
    posts: any[] = [];
    
    constructor(public navCtrl: NavController,
                public navParams: NavParams) {
        
        this.getPosts();
    }
    
    post() {
        firebase.firestore().collection("posts").add({
                message: this.message,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                owner: firebase.auth().currentUser.uid,
                owner_name: firebase.auth().currentUser.displayName
            })
            .then(doc => {
                console.log('created ', doc);
                
                this.getPosts();
            })
            .catch(err => { console.log('err ', err)})
    }
    
    getPosts() {
        this.posts = [];
        
        firebase.firestore().collection("posts").orderBy("created","desc").get()
            .then( docs => {
                
                docs.forEach( doc=> {
                    this.posts.push(doc);
                });
                
                console.log('posts', this.posts);
            
            })
            .catch( err => console.log('err ', err ))
    }
    
    ago(time) {
        let difference = moment(time).diff(moment());
        return moment.duration(difference).humanize();
    }
}
