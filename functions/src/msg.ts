import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';


//admin.initializeApp();


export const msgs = functions.database.ref(`flamelink/environments/production/content/notify/en-US/{id}`).onCreate(evt => {
        const value = evt.val();
        const payload = {
                notification: {
                        title: value.title,
                        body: value.body,
                        image: value.image
                },
        };
        return admin.database().ref('flamelink/environments/production/content/tokens/en-US/tokens-list').once('value').then(
                allToken => {
                        if (allToken.val()) {
                                console.log('token aval');
                                const token = Object.keys(allToken.val());
                                const payloadContent = admin.database().ref("flamelink/environments/production/content/tokens/en-US/tokens-list/");
                                token.forEach(t => {

                                        payloadContent.child(t).push({

                                                title: value.title,
                                                body: value.body,
                                                image: value.image,
                                                seen: false
                                        });
                                        console.log(t)
                                });
                                return admin.messaging().sendToDevice(token, payload);
                        } else {
                                console.log('no token aval')
                                return null;
                        }
                });
});