const { middleConnector, userExists, authenticate, getUserFrends, getChat, addMsg } = require('./middleman');
const express = require('express');
const cors = require('cors');
const dayjs = require('dayjs');

const PORT = 4000;
const app = express()

app.use(express.json())
app.use(cors())

middleConnector(() => {
    app.listen(PORT, (err) => {
        if(err) console.log('indx.js:: Error in listener: ',err);
        console.log('indx.js:: Server is running on http://localhost:'+PORT)
    })
})

app.get('{/}', (req, res) =>{
    console.log('indx.js:: Connected but error: path : /')
    res.status(400).end('Insufficient info');
})

const dataRouter = express.Router();
app.use('/data', dataRouter);

dataRouter.post('/:username', (req, res) => {
    console.log('indx.js:: dataRouter.post : req.params: ',JSON.stringify(req.params));
    const { username } = req.params
    if (!req.body){
        res.status(400).json({status: 3, msg: 'no user sent'});
        return;
    }
    const { user } = req.body
    console.log('indx.js:: .post: req.body: ',user)

    userExists(user, (user) => {
        if(user)
        authenticate(user)
        .then(() => {
            // res.setHeader()
            console.log('.post A')
            res.status(200).json({status: 0, user : user});
        })
        .catch(err => {
            console.log('indx.js:: Error in userExists: ',err);
            console.log('.post B')
            res.status(404).json({status: 1, msg: 'Wrong Password so page isnt loading'});
        })
        else {
            console.log('.post C')
            res.status(404).json({status: 2, msg: 'User doesnt exists so page doesnt exists'});
        }
    })
})

dataRouter.put('/:username', (req, res) => {
    if(req.body.action === 0){
        console.log('indx.js:: dataRouter.put : req.params: ',JSON.stringify(req.params));
        if(!req.body.Body){
            console.log('.put: A')
            res.status(400).json({status: 3, msg: 'no user sent'});
            return;
        }
        const {user} = req.body.Body

        userExists(user, user => {
            if(user) {
                console.log('indx.js:: .put: user',user)
                getUserFrends(user)
                .then((f) => {
                    console.log('.put: B')
                    console.log('indx.js:: .put: frends (f) : ',f)
                    res.status(200).json({status: 0, frends: f});
                })
            }
            // else {
            //     console.log('.put: C')
            //     res.status(400).json({status: 2, msg: 'User doesnt exists so page doesnt exists'})
            // }
        })
    }
    else if(req.body.action === 1){
        console.log('indx.js:: dataRouter.head : req.params: ',JSON.stringify(req.params));
        // if(!req.body){
        //     res.status(400).json({status: 3, msg: 'no user sent'});
        //     return;
        // }
        console.log('indx.js:: dataRouter.head : req.body: ',req.body);
        if(req.body.Body){
            const {user1, user2} = req.body.Body;
            getChat(user1, user2)
            .then (c => {
                console.log('indx.js:: .get : chat: ',JSON.stringify(c));
                console.log('.get: A')
                res.status(200).json({status: 0, chat: c});
            })
        } else {
            console.log('.get: B')
            res.status(400).json({status: 3, msg: 'no user sent'});
            // res.status()
        }
    } 
    else if(req.body.action === 2){
        console.log('indx.js:: dataRouter.post2 : req. params: ', JSON.stringify(req.prams))
        console.log('indx.js:: dataRouter.head : req.body: ',req.body);
        
        if(req.body.Body){
            const {msg, frendUsername} = req.body.Body;
            msg.time.sent = dayjs().toDate();
            msg.status = 'S';
            addMsg(msg, frendUsername)
            .then(chatReturned => {
                console.log('indx.js:: .put : action2: ',
                    // JSON.stringify(chatReturned)
                );
                console.log('.put: 2A')
                res.status(200).json({status: 0, chat: chatReturned});
            })
            .catch(err => {
                console.log('in .put action2.catch: ', err)
            })
        } else {
            console.log('.get: B')
            res.status(400).json({status: 3, msg: 'no user sent'});
            // res.status()
        }
    }
    
     
})
