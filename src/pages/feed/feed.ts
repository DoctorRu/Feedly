import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import firebase from "firebase";
import moment from "moment";
import * as _ from 'lodash';

@Component({
    selector: 'page-feed',
    templateUrl: 'feed.html',
})
export class FeedPage {
    
    message: string = '';
    posts: any[] = [];
    pageSize: number = 3;
    cursor: any;
    
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
            .catch(err => {
                console.log('err ', err)
            })
    }
    
    getPosts() {
        this.posts = [];
        
        firebase.firestore().collection("posts")
            .orderBy("created", "desc")
            .limit(this.pageSize)
            .get()
            .then(docs => {
                
                docs.forEach(doc => {
                    this.posts.push(doc);
                });
                
                this.cursor = _.last(this.posts);
                console.log('cursor ', this.cursor);
                
                // console.log('posts', this.posts);
                
            })
            .catch(err => console.log('err ', err))
        
    }
    
    
    loadMorePosts(event) {
        
        firebase.firestore().collection("posts")
            .orderBy("created", "desc")
            .startAfter(this.cursor)
            .limit(this.pageSize)
            .get()
            .then(docs => {
                
                docs.forEach(doc => {
                    this.posts.push(doc);
                });
                
                console.log('posts', this.posts);
                
                if (docs.size < this.pageSize) {
                    event.enable(false);
                } else {
                    event.complete();
                    this.cursor = _.last(this.posts);
    
                }
                
            })
            .catch(err => console.log('err ', err))
    }
    
    ago(time) {
        let difference = moment(time).diff(moment());
        return moment.duration(difference).humanize();
    }
    
}
