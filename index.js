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
        if(err) console.log('indx.js:: Error in listener: ',err);   //////////////////////
        console.log('indx.js:: Server is running on http://localhost:'+PORT)   //////////////////////
        requests.forEach((request,i) => console.log(`request${i}.username: `,request.username))
        // requests = []
    })
})

app.get('{/}', (req, res) =>{
    console.log('indx.js:: Connected but error: path : /')   //////////////////////
    res.status(400).end('Insufficient info');
})

const dataRouter = express.Router();
app.use('/data', dataRouter);
 
dataRouter.post('/:username', (req, res) => {
    console.log('-'.repeat(80),'\nindx.js:: dataRouter.post : req.params: ',JSON.stringify(req.params));   //////////////////////
    const { username } = req.params
    if (!req.body){
        res.status(400).json({status: 3, msg: 'no user sent'});
        return;
    }
    const { user } = req.body
    console.log('indx.js:: .post: req.body: ',user)   //////////////////////

    userExists(user, (user) => {
        if(user)
        authenticate(user)
        .then(() => {
            // res.setHeader()
            console.log('.post A')   //////////////////////
            res.status(200).json({status: 0, user : user});
        })
        .catch(err => {
            console.log('indx.js:: Error in userExists: ',err);   //////////////////////
            console.log('.post B')   //////////////////////
            res.status(404).json({status: 1, msg: 'Wrong Password so page isnt loading'});
        })
        else {
            console.log('.post C')   //////////////////////
            res.status(404).json({status: 2, msg: 'User doesnt exists so page doesnt exists'});
        }
    })
})

dataRouter.put('/:username', (req, res) => {
    if(req.body.action === 0){
        console.log('indx.js:: dataRouter.put : req.params: ',JSON.stringify(req.params));   //////////////////////
        if(!req.body.Body){
            console.log('.put: A')   //////////////////////
            res.status(400).json({status: 3, msg: 'no user sent'});
            return;
        }
        const {user} = req.body.Body

        userExists(user, user => {
            if(user) {
                console.log('indx.js:: .put: user',user)   //////////////////////
                getUserFrends(user)
                .then((f) => {
                    console.log('.put: B')   //////////////////////
                    // console.log('indx.js:: .put: frends (f) : ',f)   //////////////////////
                    res.status(200).json({status: 0, frends: f});
                })
            }
            // else {
            //     console.log('.put: C')   //////////////////////
            //     res.status(400).json({status: 2, msg: 'User doesnt exists so page doesnt exists'})
            // }
        })
    }
    else if(req.body.action === 1){
        console.log('indx.js:: dataRouter.head : req.params: ',JSON.stringify(req.params));   //////////////////////
        // if(!req.body){
        //     res.status(400).json({status: 3, msg: 'no user sent'});
        //     return;
        // }
        console.log('indx.js:: dataRouter.head : req.body: ',req.body);   //////////////////////
        if(req.body.Body){
            const {user1, user2} = req.body.Body;
            getChat(user1, user2)
            .then (c => {
                // console.log('indx.js:: .get : chat: ',JSON.stringify(c));   //////////////////////
                console.log('.get: A')   //////////////////////
                res.status(200).json({status: 0, chat: c});
            })
        } else {
            console.log('.get: B')   //////////////////////
            res.status(400).json({status: 3, msg: 'no user sent'});
            // res.status()
        }
    } 
    else if(req.body.action === 2){
        // console.log('indx.js:: dataRouter.post2 : req. params: ', JSON.stringify(req.prams))   //////////////////////
        // console.log('indx.js:: dataRouter.head : req.body: ',req.body);   //////////////////////
        
        if(req.body.Body){
            const {msg, frendUsername} = req.body.Body;
            msg.time.sent = dayjs().toDate();
            msg.status = 'S';
            addMsg(msg, frendUsername)
            .then(chatReturned => {
                console.log('indx.js:: .put : action2: ',   //////////////////////
                    // JSON.stringify(chatReturned)
                );
                console.log('.put: 2A')   //////////////////////
                searchRequests(msg.sender, frendUsername)
                res.status(200).json({status: 0, chat: chatReturned});
            })
            .catch(err => {
                console.log('in .put action2.catch: ', err)   //////////////////////
            })
        } else {
            console.log('.get: B')   //////////////////////
            res.status(400).json({status: 3, msg: 'no user sent'});
            // res.status()
        }
    }
})


// Chat -----------------------------------------------------------------------------------

const chatRouter = express.Router()
app.use('/chatter', chatRouter);
// function wait(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }
let wait = 10;
class Request{
    constructor(username, req, res){
        this.username = username;
        this.req = req;
        this.res = res;
    }
    wait(){
        return new Promise((resolve) => {
            const id = setTimeout(resolve, wait*1000)
            timerIds.push(id)
        })
    }
}
let timerIds = []
let requests = []
chatRouter.post('/:username', (req, res) => {
    // const { username } = req.params
    console.log('getting req:: req.params: ',req.params)   //////////////////////
    console.log('getting req:: req.body: ',req.body)   //////////////////////
    const { username } = req.body
    // requests.find((request) => request.username === username)
    let userRequest = requests.find((request) => request.username === username)
    if(!userRequest){
        userRequest = new Request(username,req, res)
        requests.push(userRequest)
    }
    // requests.forEach((request,i) => console.log(`request${i}.username: `,request.username))
    userRequest.wait().then(() => {
        console.log(`1Waited ${wait} secs - sending the response`)   //////////////////////
        res.status(203).json({status: 1})
    })
}) 

function searchRequests(username, frendUsername){
    let i = -1;
    requests.forEach((request,i) => console.log(`request${i}.username: `,request.username))
    console.log('searchReqs:: username: ',username,'-- -- frendUsername: ',frendUsername)
    let foundIndex = requests.findIndex(r => r.username === username)
    if(foundIndex !== -1){
        console.log('searchReqs:: Request found, sending response -- the request: ',found.username)   //////////////////////
        clearTimeout(timerIds[foundIndex]);
        requests[i].res.status(200).json({status: 0, frend: frendUsername})
        requests.splice(index, 1); // remove the handled request
        timerIds.splice(index, 1); // cleanup
    } else {
        console.log('searchReqs:: not found, Doing nothing')   //////////////////////
    }
}



/*
Errors in my code:
Major Problems (with explanations)
1. Wrong Promise usage in Request.wait()
    return new Promise(resolve => timerIds.push(setTimeout(() => resolve, 5*1000)))

    Problem: resolve is never called — you’re just returning a function reference, not invoking it.
    So the promise never resolves, meaning .then() is never triggered.

    Fix:
        wait() {
            return new Promise(resolve => {
                const id = setTimeout(resolve, 5 * 1000);
                timerIds.push(id);
            });
        }


2. Wrong username source in router
    const { username } = req.body

    You defined the route as /chatter/:username, so username should come from req.params, not req.body.
    Fix:
        const { username } = req.params;

    If you still want to send it from body, remove :username from the route.


3. You always wait on the last request only
    requests.at(-1).wait().then(...)

    You always apply wait() on the most recent request, even if you already have one from the same user.
    Fix:
    Find the corresponding Request object:
        let userRequest = requests.find(r => r.username === username);
        if (!userRequest) {
        userRequest = new Request(username, req, res);
            requests.push(userRequest);
        }
        userRequest.wait().then(() => {
            console.log('Waited 5 secs - sending the response');
            res.status(203).json({ status: 1 });
        });


4. Wrong use of i in searchRequests()
        let i = -1;
        requests.forEach((request,i) => console.log(...))
        let found = requests.find((request) => {
            i++;
            return request.username === username;
        })
        clearTimeout(timerIds[i]);

    The i you’re incrementing manually is not tied to the .find() index.
    The timer you clear might be wrong or even undefined.
    Fix using findIndex:
        function searchRequests(username, frendUsername) {
        console.log('searchReqs:: username:', username, 'frendUsername:', frendUsername);

        const index = requests.findIndex(r => r.username === username);
            if (index !== -1) {
                console.log('searchReqs:: Request found, sending response');
                clearTimeout(timerIds[index]);
                requests[index].res.status(200).json({ status: 0, frend: frendUsername });
                requests.splice(index, 1); // remove the handled request
                timerIds.splice(index, 1); // cleanup
            } else {
                console.log('searchReqs:: not found, doing nothing');
            }
        }

5. Unused req and res references can cause memory leaks
    You’re holding onto res objects in memory indefinitely.
    If not cleared after use, these can leak memory.
    Make sure to remove handled requests from the array after sending the response:
        requests.splice(index, 1);
        timerIds.splice(index, 1);

        
6. ⚠️ Frontend logic issues
axios.post(`/chatter/${currentUsername}`, {
  username: 'user1'
})


Here, you’re sending "user1" as username, even though the URL already has currentUsername.
This might confuse the backend (are we checking for "user1" or "currentUsername"?).

✅ Use it clearly:

URL: /chatter/<currentUser>

Body: { friend: <friendName> }
(for clarity)

Also, tempNotifications is a mutable reference.
setNotifications won’t trigger re-render unless you pass a new Map instance.

✅ Fix:

let tempNotifications = new Map(notifications);

✅ Final Corrected Backend Version (simplified)
const chatRouter = express.Router();
app.use('/chatter', chatRouter);

let timerIds = [];
let requests = [];

class Request {
  constructor(username, req, res) {
    this.username = username;
    this.req = req;
    this.res = res;
  }

  wait() {
    return new Promise(resolve => {
      const id = setTimeout(resolve, 5 * 1000);
      timerIds.push(id);
    });
  }
}

chatRouter.post('/:username', (req, res) => {
  const { username } = req.params;
  console.log('Incoming req from:', username);

  let userRequest = requests.find(r => r.username === username);
  if (!userRequest) {
    userRequest = new Request(username, req, res);
    requests.push(userRequest);
  }

  userRequest.wait().then(() => {
    console.log('Waited 5 secs - sending timeout response');
    res.status(203).json({ status: 1 });
  });
});

function searchRequests(username, frendUsername) {
  const index = requests.findIndex(r => r.username === username);
  if (index !== -1) {
    console.log(`Found ${username}, responding with message from ${frendUsername}`);
    clearTimeout(timerIds[index]);
    requests[index].res.status(200).json({ status: 0, frend: frendUsername });
    requests.splice(index, 1);
    timerIds.splice(index, 1);
  } else {
    console.log('No waiting request found for', username);
  }
}

🧠 Summary — Will It Work?

✅ Yes — after these fixes, it will work as a minimal backend for chat message delivery using long-polling.
⚙️ But remember:

It’s not scalable (in-memory, single server only).

Each user’s connection blocks one res object.

Use WebSockets (Socket.IO) for production chat.

*/