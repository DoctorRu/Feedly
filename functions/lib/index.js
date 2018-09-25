"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
exports.updateLikesCount = functions.https.onRequest((request, response) => {
    console.log('request> ', request.body);
    const postId = request.body.postId;
    const userId = request.body.userId;
    const action = request.body.action; // Werde sein 'mogën' oder 'nicht mogën'
    admin.firestore().collection("posts").doc(postId).get()
        .then(result => {
        let likesCount = result.data().likesCount || 0;
        let likes = result.data().likes || [];
        let updateData = {};
        if (action == "like") {
            updateData["likesCount"] = ++likesCount;
            updateData[`likes.${userId}`] = true;
        }
        else {
            updateData["likesCount"] = --likesCount;
            updateData[`likes.${userId}`] = false;
        }
        admin.firestore().collection("posts").doc(postId).update(updateData)
            .then(() => {
            response.status(200).send('Done');
        })
            .catch(err => {
            response.status(err.code).send(err.message);
        });
    })
        .catch(err => console.log('trigger get error: ', err));
});
exports.updateCommentsCount = functions.firestore.document('comments/{commentId}')
    .onCreate((event) => __awaiter(this, void 0, void 0, function* () {
    let data = event.data();
    let postId = data.post;
    let doc = yield admin.firestore().collection("posts").doc(postId).get();
    if (doc.exists) {
        let commentsCount = doc.data().commentsCount || 0;
        commentsCount++;
        yield admin.firestore().collection("posts").doc(postId).update({
            "commentsCount": commentsCount
        });
        return true;
    }
    else {
        return false;
    }
}));
//# sourceMappingURL=index.js.map