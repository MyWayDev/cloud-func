import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
console.log("Starting...");

export const indoNotiy =
        functions.database.ref(`flamelink/environments/indoProduction/content/notify/en-US/{id}`).onCreate
                (evt => {
                        const value = evt.val();
                        var chunk = (arr: any[], size: number) =>
                                Array.from({ length: Math.ceil(arr.length / size) }, (_: any, i: number) =>
                                        arr.slice(i * size, i * size + size)
                                );
                        const payload = {
                                notification: {
                                        title: value.title,
                                        body: value.body,
                                        image: value.image
                                },
                        };
                        return admin.database().ref('indoDb/tokens/tokens-list/').once('value').then(
                                allToken => {
                                        if (allToken.val()) {
                                                const token = Object.keys(allToken.val());
                                                const payloadContent = admin.database().ref("indoDb/tokens/tokens-list/");
                                                const msgChunks = chunk(token, 1000);
                                                console.log("Chunking......");
                                                for (var msgChunk = 0; msgChunk < msgChunks.length; msgChunk++) {
                                                        msgChunks[msgChunk].forEach(t => {

                                                                payloadContent.child(t).push({

                                                                        title: value.title,
                                                                        body: value.body,
                                                                        image: value.image,
                                                                        seen: false
                                                                });
                                                                console.log(t)
                                                        });
                                                        console.log(msgChunks[msgChunk].length + " # " + msgChunk);
                                                        return admin.messaging().sendToDevice(msgChunks[msgChunk], payload);
                                                }
                                                console.log(msgChunks[msgChunk].length.toString())
                                                return null;

                                        } else {
                                                console.log('No Token Aval...')
                                                return null;
                                        }

                                });
                });