import {Component} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import * as firebase from "firebase";
import moment from 'moment';

@Component({
    selector: 'page-comments',
    templateUrl: 'comments.html',
})

export class CommentsPage {
    
    post: any = [];
    comments: any = [];
    
    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private viewCtrl: ViewController
    ) {
        this.post = this.navParams.get("post");
        console.log('post> ', this.post);
        
        firebase.firestore().collection("comments")
            .where("post", "==", this.post.id)
            .orderBy("created","desc")
            .get()
            .then(data => {
                this.comments = data.docs;
            })
            .catch(err => {
                console.log('get comments err>', err)
            })
    }
    
    
    ago(time) {
        let difference = moment(time).diff(moment());
        return moment.duration(difference).humanize();
    }
    
    
    close(){
        this.viewCtrl.dismiss();
    }
}
