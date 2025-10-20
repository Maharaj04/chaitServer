const { connectToMongo } = require('./chatDB.js');
let db;
function middleConnector(listener){
    connectToMongo((dbresponse, err) => {
        if(err) {
            console.log('mm.js:: Error in connecting db: ',err);
            return;
        }
        db = dbresponse;
        console.log('mm.js:: Mongo is connected, db is ready');
        listener();
    })
}

function authenticate(user){
    return new Promise((resolve, reject) => {
        db.collection('users')
        .findOne({username : user.username})
        .then(returnedUser => {
            if(user.password === returnedUser.password) resolve();
            else reject('Wrong Password');
        })
        .catch(err => {
            console.log('mm.js:: Error(userDoesntExist) in authenticate: ',err);
            reject(err);
        })
    })
}

function userExists(user, func){
    db.collection('users')
    .findOne({username : user.username})
    .then(doc => {
        func(doc);
    })
    .catch(err => {
        console.log('mm.js:: Error in userExists() : ',err);
        func(undefined);
    })
}

function changeName(user){

}

async function getUserFrends(user){
    let users = await db.collection('users').find().toArray()
    let frnds = users.filter((usr) => {
        return user.frends.includes(usr.username)
    })
    return frnds;
}

// async function getChat(user1, user2){
//     await db.collection('chats')
//     .find({id : user1.username+"-"+user2.username})
//     .then(returnedChat => {
//         return returnedChat;
//     })
//     .catch(err => {
//         console.log(err);
//         return undefined;
//     })
// }

/*
    The key problems
    1. You never return anything from getChat()
        Your function is declared as async, so it always returns a Promise —
        but you never return any value from that function body.
        That means the Promise resolves to undefined.
        Even though you have a return statement inside .then(), that only returns from the inner callback — not from the outer async function.
        So this line:
            return returnedChat;
        only returns from .then(...), not from getChat() itself.

    2. await is being used incorrectly
        You wrote:
            await db.collection('chats').find(...).then(...)
        But the purpose of await is to avoid using .then().
        When you combine them, await just waits for the entire .then() chain to complete — and since you don’t return anything out of that chain, it resolves to undefined.
        In other words:
            .then() returns a Promise.
        You await that Promise.
        The Promise resolves to whatever the .then() callback returns.
        But since you didn’t propagate that return value out of your async function, it’s lost.

    3. MongoDB .find() doesn’t return a Promise with results
        This is a smaller but important issue:
        db.collection('chats').find() returns a cursor, not the actual data.
        To get the data, you’d need to do:
            await db.collection('chats').find(...).toArray();
        or use findOne() if you expect only one result.
        So even if your .then() returned properly, you’d still be returning a cursor, not the chat document(s).
*/

async function getChat(user1, user2) {
    try {
        const chat = await db.collection('chats')
        .findOne({ id: user1.username + "-" + user2.username });
        return chat;
    } catch (err) {
        console.error(err);
        return null; // or throw err if you want the caller to handle it
    }
}


module.exports = { middleConnector, authenticate, userExists, changeName, getUserFrends, getChat }