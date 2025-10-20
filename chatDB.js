// import { MongoClient } from 'mongodb';
// import { genUserId } from './id_generator.js';
const { MongoClient } = require('mongodb')
const { genUserId, genChatId } = require('./id_generator.js')
const dayjs = require('dayjs')



function connectToMongo(cb){
    MongoClient.connect('mongodb://localhost:27017')
    .then(client => {
        console.log('connected to server')
        db = client.db('chatsystem');
        cb(db , undefined);
    })
    .catch(err => {
        cb(undefined, err)
        console.log(err) 
    })
}
connectToMongo(()=>{});

function Users(){
    db.collection('users').insertMany([
        {
            id: genUserId(),
            username: 'user1',
            password: 'password1',
            frends:[],
            name: 'UserOne',
        },{
            id: genUserId(),
            username: 'user2',
            password: 'password2',
            frends:[],
            name: 'UserTwo',
        },{
            id: genUserId(),
            username: 'user3',
            password: 'password3',
            frends:[],
            name: 'UserThree',
        },{
            id: genUserId(),
            username: 'user4',
            password: 'password4',
            frends:[],
            name: 'UserFour',
        }
    ])
}
async function Frends(){
    const allUsers = await db.collection('users').find().toArray();
    console.log(allUsers)
    try{
        for(const user of allUsers){
            const tempfrends = allUsers.filter(u => u.username !== user.username)
            .map(u => u.id);
            console.log(tempfrends)
            await db.collection('users').updateOne({id: user.username}, {$set: {frends : tempfrends}})
        }
    } catch(err) {
        console.log(err);
    }
}

async function Chats(){
    const allUsers = await db.collection('users').find().toArray();
    const chats = [
    {
        id : genChatId(allUsers[0], allUsers[1]),
        chatUsers : [
            allUsers[0].id, allUsers[1].id
        ],
        msgs : [
            {
                // id: genMsgId(chats[0], 0),
                time: dayjs().format('h:mm a'),
                sender: allUsers[0].username,
                text: 'Hello How are you',
                document: [
                    'image.jpg'
                ]
            },{
                // id: genMsgId(chats[0], 1),
                time: dayjs().format('h:mm a'),
                sender: allUsers[1].id,
                text: 'I am fine',
                document: [
                    'text.txt'
                ]
            },{
                // id: genMsgId(chats[0], 2),
                time: dayjs().format('h:mm a'),
                sender: allUsers[1].id,
                text: 'I am not fine',
                document: []
            },{
                // id: genMsgId(chats[0], 3),
                time: dayjs().format('h:mm a'),
                sender: allUsers[0].id,
                text: `I am jose moreno but not that one -- I am not that one `,
                document: []
            }
        ]
    },{
        id : genChatId(allUsers[1], allUsers[2]),
        chatUsers : [
            allUsers[1].id, allUsers[2].id
        ],
        msgs : [
            {
                // id: genMsgId(chats[0], 0),
                time: dayjs().format('h:mm a'),
                sender: allUsers[2].id,
                text: 'Hello How are you',
                document: [
                    'image.jpg'
                ]
            },{
                // id: genMsgId(chats[0], 1),
                time: dayjs().format('h:mm a'),
                sender: allUsers[2].id,
                text: 'I am fine',
                document: [
                    'text.txt'
                ]
            },{
                // id: genMsgId(chats[0], 2),
                time: dayjs().format('h:mm a'),
                sender: allUsers[1].id,
                text: 'I am not fine',
                document: []
            },{
                // id: genMsgId(chats[0], 3),
                time: dayjs().format('h:mm a'),
                sender: allUsers[2].id,
                text: `I am jose moreno but not that one -- I am not that one `,
                document: []
            }
        ]
    }
    ]

    await db.collection('chats').insertMany(chats)
    .then( result => {
        console.log(result);
    })
    .catch(err => {
        console.log(err);
    })

}

module.exports = { connectToMongo }
