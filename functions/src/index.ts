import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

export const updateLikesCount = functions.https.onRequest((request, response) => {
    
    console.log(request.body);
    
    const postId = request.body.postId;
    const userId = request.body.userId;
    const action = request.body.action; // Werde sein 'mag' oder 'nicht mag'
    
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
                .then( () => {
                    response.status(200).send('Done');
                })
                .catch(err => console.log('trigger update error: ', err))
            
        })
        .catch(err => console.log('trigger get error: ', err))
});