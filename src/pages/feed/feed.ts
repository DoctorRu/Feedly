import {Component} from '@angular/core';
import {LoadingController, NavController, NavParams, ToastController} from 'ionic-angular';
import firebase from "firebase";

import {Camera, CameraOptions} from "@ionic-native/camera";

import moment from "moment";
import * as _ from 'lodash';

import {LoginPage} from "../login/login";

@Component({
    selector: 'page-feed',
    templateUrl: 'feed.html',
})
export class FeedPage {
    
    message: string = '';
    posts: any[] = [];
    pageSize: number = 10;
    cursor: any;
    infiniteEvent: any;
    image: string;
    
    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private loadingCtrl: LoadingController,
                private toastCtrl: ToastController,
                private camera: Camera) {
        
        this.getPosts();
    }
    
    uploadPost() {
        firebase.firestore().collection("posts").add({
                message: this.message,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                owner: firebase.auth().currentUser.uid,
                owner_name: firebase.auth().currentUser.displayName
            })
            .then(doc => {
                console.log('created ', doc);
                
                if (this.image) {
                    this.upload(doc.id)
                }
                
                this.message = '';
                
                let toast = this.toastCtrl.create({
                    message: 'Your post has been created successfully.',
                    duration: 3000
                });
                
                toast.present();
                
                this.getPosts();
            })
            .catch(err => {
                console.log('err ', err)
            })
    }
    
    
    getPosts() {
        this.posts = [];
        
        let loading = this.loadingCtrl.create({
            content: 'Loading feed...'
        });
        
        loading.present();
        
        let query = firebase.firestore().collection("posts")
            .orderBy("created", "desc")
            .limit(this.pageSize);
        
        // query.onSnapshot(snapshot => {
        //     let changedDocs = snapshot.docChanges();
        //
        //     changedDocs.forEach(change => {
        //         if (change.type == 'added') {
        //
        //         } else if (change.type == 'modified') {
        //
        //         } else if (change.type == 'removed') {
        //
        //         }
        //
        //         console.log(`Document with id: ${change.doc.id} has been ${change.type}.`);
        //     });
        // });
        
        query.get()
            .then(docs => {
                docs.forEach(doc => {
                        this.posts.push(doc);
                    }
                );
                
                loading.dismissAll();
                
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
                    this.infiniteEvent = event;
                    
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
    
    
    refresh(event) {
        this.posts = [];
        
        this.getPosts();
        
        if (this.infiniteEvent) {
            this.infiniteEvent.enable(true);
        }
        
        event.complete();
        
    }
    
    
    logout() {
        firebase.auth().signOut()
            .then(() => {
                
                let toast = this.toastCtrl.create({
                    message: 'You have been logged out successfully.',
                    duration: 3000
                });
                
                toast.present();
                
                this.navCtrl.setRoot(LoginPage)
            });
    }
    
    
    addPhoto() {
        this.launchCamera();
    }
    
    
    launchCamera() {
        let options: CameraOptions = {
            quality: 100,
            sourceType: this.camera.PictureSourceType.CAMERA,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.PNG,
            mediaType: this.camera.MediaType.PICTURE,
            correctOrientation: true,
            targetHeight: 512,
            targetWidth: 512,
            allowEdit: true
        };
        
        this.camera.getPicture(options)
            .then(base64Image => {
                console.log(base64Image);
                
                this.image = "data:image/png;base64," + base64Image;
            })
            .catch(err => console.log('Camera error', err))
    }
    
    upload(name: string) {
        let ref = firebase.storage().ref("postImages/" + name);
        
        let uploadTask = ref.putString(this.image.split(',')[ 1 ], "base64");
        
        uploadTask.on("state_changed", takeSnapshot => {
            console.log(takeSnapshot)
        }, err => {
            console.log('Upload error: ', err);
        }, () => {
            console.log("Upload complete");
            
            uploadTask.snapshot.ref.getDownloadURL()
                .then(url => {
                    console.log(('File url: '), url)
                })
            
        })
    }
    
}





















