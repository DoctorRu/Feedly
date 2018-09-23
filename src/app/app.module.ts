import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import firebase from 'firebase';

import {Camera} from "@ionic-native/camera";

import * as keys_firebase from "../keys/firebase";

import {MyApp} from './app.component';
import {LoginPage} from '../pages/login/login';
import {SignupPage} from "../pages/signup/signup";
import {FeedPage} from "../pages/feed/feed";

firebase.initializeApp(keys_firebase.config);
const firestore = firebase.firestore();
const settings = {
    timestampsInSnapshots: true
};
firestore.settings(settings);

@NgModule({
    declarations: [
        MyApp,
        LoginPage,
        SignupPage,
        FeedPage
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [ IonicApp ],
    entryComponents: [
        MyApp,
        LoginPage,
        SignupPage,
        FeedPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        Camera,
        {
            provide: ErrorHandler, useClass: IonicErrorHandler
        }
    ]
})
export class AppModule {
}
