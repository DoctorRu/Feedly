import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);


const sendNotification = (owner_uid, type) => {
    
    return new Promise((resolve, reject) => {
        
        return admin.firestore().collection("users").doc(owner_uid).get()
            .then(doc => {
                
                if (doc.exists && doc.data().token) {
                    
                    if (type == "new_comment") {
                        admin.messaging().sendToDevice(doc.data().token,
                            {
                                data: {
                                    title: "A new comment has been made on your post.",
                                    sound: "default",
                                    body: "Tap to check"
                                }
                            })
                            .then(sent => {
                                resolve(sent)
                            })
                            .catch(err => {
                                reject(err)
                            })
                        
                    } else if (type == "new_like") {
                        admin.messaging().sendToDevice(doc.data().token,
                            {
                                data: {
                                    title: "Someone liked your post on Feedly",
                                    sound: "default",
                                    body: "Tap to check"
                                }
                            })
                            .then(sent => {
                                resolve(sent)
                            })
                            .catch(err => {
                                reject(err)
                            })
                    }
                }
            })
    })
};


export const updateLikesCount = functions.https.onRequest((request, response) => {
    
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
                updateData[ "likesCount" ] = ++likesCount;
                updateData[ `likes.${userId}` ] = true;
            } else {
                updateData[ "likesCount" ] = --likesCount;
                updateData[ `likes.${userId}` ] = false;
            }
            
            admin.firestore().collection("posts").doc(postId).update(updateData)
                .then(async () => {
                    
                    if (action == "like") {
                        await sendNotification(result.data().owner, "new_like")
                    }
                    
                    response.status(200).send('Done');
                })
                .catch(err => {
                    response.status(err.code).send(err.message);
                })
            
        })
        .catch(err => console.log('trigger get error: ', err))
});


export const updateCommentsCount = functions.firestore.document('comments/{commentId}')
    .onCreate(async (event) => {
        let data = event.data();
        let postId = data.post;
        let doc = await admin.firestore().collection("posts").doc(postId).get();
        
        if (doc.exists) {
            let commentsCount = doc.data().commentsCount || 0;
            commentsCount++;
            
            await admin.firestore().collection("posts").doc(postId).update({
                "commentsCount": commentsCount
            });
            
            return sendNotification(doc.data().owner, "new_comment");
            
        } else {
            
            return false;
        }
    });
    

