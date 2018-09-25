import {Component} from '@angular/core';
import {
    ActionSheetController,
    AlertController,
    LoadingController, ModalController,
    NavController,
    NavParams,
    ToastController
} from 'ionic-angular';
import firebase from "firebase";
import {HttpClient} from "@angular/common/http";
import {Camera, CameraOptions} from "@ionic-native/camera";

import moment from "moment";
import * as _ from 'lodash';

import {LoginPage} from "../login/login";
import {CommentsPage} from "../comments/comments";

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
                private camera: Camera,
                private http: HttpClient,
                private actionSheetCtr: ActionSheetController,
                private alertCtrl: AlertController,
                private modalCtrl: ModalController) {
        
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
                    this.uploadImage(doc.id)
                }
                
                this.message = '';
                this.image = undefined;
                
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
    
    
    uploadImage(name: string) {
        return new Promise((resolve, reject) => {
            
            let uploading = this.loadingCtrl.create({
                content: 'Uploading image...'
            });
            
            uploading.present();
            
            let ref = firebase.storage().ref("postImages/" + name);
            
            let uploadTask = ref.putString(this.image.split(',')[ 1 ], "base64");
            
            uploadTask.on("state_changed", (taskSnapshot: any) => {
                
                console.log(taskSnapshot);
                
                let percentage = taskSnapshot.bytesTransferred / taskSnapshot.totalBytes * 100;
                uploading.setContent("Uploaded " + Math.round(percentage) + "%");
                
            }, err => {
                console.log('Upload error: ', err);
                
            }, () => {
                console.log("Upload complete");
                
                uploadTask.snapshot.ref.getDownloadURL()
                    .then(url => {
                        console.log(('File url: '), url);
                        
                        firebase.firestore().collection("posts").doc(name).update({
                                image: url
                            })
                            .then(() => {
                                uploading.dismiss();
                                resolve();
                            })
                            .catch(() => {
                                uploading.dismiss();
                                reject();
                            })
                    })
                    .catch(() => {
                        uploading.dismiss();
                        reject();
                    })
            })
        });
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
        
        query.onSnapshot(snapshot => {
            let changedDocs = snapshot.docChanges();
            
            changedDocs.forEach(change => {
                if (change.type == 'added') {
                
                } else if (change.type == 'modified') {
                    for (let i = 0; i < this.posts.length; i++) {
                        if (this.posts[ i ].id == change.doc.id) {
                            this.posts[ i ] = change.doc;
                        }
                    }
                    
                } else if (change.type == 'removed') {
                
                }
                
                console.log(`Document with id: ${change.doc.id} has been ${change.type}.`);
            });
        });
        
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
    
    
    like(post) {
        
        let body = {
            postId: post.id,
            userId: firebase.auth().currentUser.uid,
            action: post.data().likes && post.data().likes[ firebase.auth().currentUser.uid ] == true ? "unlike" : "like"
        };
        
        let toast = this.toastCtrl.create({
            message: "Updating like... please wait."
        });
        
        toast.present();
        
        this.http.post("https://us-central1-feedlyapp-9b845.cloudfunctions.net/updateLikesCount",
            JSON.stringify(body),
            {responseType: "text"})
            .subscribe(
                data => {
                    console.log(data);
                    
                    toast.setMessage("Like updated!");
                    
                    setTimeout(() => {
                        toast.dismiss();
                    }, 3000)
                },
                err => {
                    console.log(err)
                    
                    toast.setMessage("An error has ocurred. Please try again later!");
                    
                    setTimeout(() => {
                        toast.dismiss();
                    }, 3000)
                }
            )
    }
    
    comment(post) {
        
        this.actionSheetCtr.create(
            {
                buttons: [
                    {
                        text: "View all comments",
                        handler: () => {
                            
                            this.modalCtrl.create(CommentsPage, {
                                "post": post
                            }).present();
                        }
                    },
                    {
                        text: "New comment",
                        handler: () => {
                            
                            this.alertCtrl.create({
                                title: "New comment",
                                message: "Type your comment",
                                inputs: [
                                    {
                                        name: "comment",
                                        type: "text"
                                    }
                                ],
                                buttons: [
                                    {
                                        text: "Cancel"
                                    },
                                    {
                                        text: "Post",
                                        handler: (data) => {
                                            
                                            if (data.comment) {
                                                firebase.firestore().collection("comments").add({
                                                        text: data.comment,
                                                        post: post.id,
                                                        owner: firebase.auth().currentUser.uid,
                                                        owner_name: firebase.auth().currentUser.displayName,
                                                        created: firebase.firestore.FieldValue.serverTimestamp()
                                                    })
                                                    .then(() => {
                                                        this.toastCtrl.create({
                                                            message: "Comment posted successfully.",
                                                            duration: 3000
                                                        }).present();
                                                    })
                                                    .catch(err => {
                                                        this.toastCtrl.create({
                                                            message: err.message,
                                                            duration: 3000
                                                        }).present();
                                                    })
                                            }
                                            
                                        }
                                    }
                                ]
                            }).present();
                        }
                    }
                ]
            }
        ).present();
        
    }
}





















