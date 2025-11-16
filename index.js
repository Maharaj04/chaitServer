const { middleConnector, userExists, authenticate, getUserFrends, getChat, addMsg } = require('./middleman');
const express = require('express');
const cors = require('cors');
const dayjs = require('dayjs');

const PORT = 4000;
const app = express()

app.use(express.json())
app.use(cors())

const text = {
    color: {
        black:  "\x1b[30m",
        red:    "\x1b[31m",
        green:  "\x1b[32m",
        yellow: "\x1b[33m",
        blue:   "\x1b[34m",
        magenta:"\x1b[35m",
        cyan:   "\x1b[36m",
        white:  "\x1b[37m",

        // Bright colors
        brightBlack:   "\x1b[90m",
        brightRed:     "\x1b[91m",
        brightGreen:   "\x1b[92m",
        brightYellow:  "\x1b[93m",
        brightBlue:    "\x1b[94m",
        brightMagenta: "\x1b[95m",
        brightCyan:    "\x1b[96m",
        brightWhite:   "\x1b[97m",
    },

    background: {
        black:  "\x1b[40m",
        red:    "\x1b[41m",
        green:  "\x1b[42m",
        yellow: "\x1b[43m",
        blue:   "\x1b[44m",
        magenta:"\x1b[45m",
        cyan:   "\x1b[46m",
        white:  "\x1b[47m",

        // Bright backgrounds
        brightBlack:   "\x1b[100m",
        brightRed:     "\x1b[101m",
        brightGreen:   "\x1b[102m",
        brightYellow:  "\x1b[103m",
        brightBlue:    "\x1b[104m",
        brightMagenta: "\x1b[105m",
        brightCyan:    "\x1b[106m",
        brightWhite:   "\x1b[107m"
    },

    format: {
        reset:       "\x1b[0m",
        bold:        "\x1b[1m",
        dim:         "\x1b[2m",
        italic:      "\x1b[3m",
        underline:   "\x1b[4m",
        blink:       "\x1b[5m",
        reverse:     "\x1b[7m",  // swap fg/bg
        hidden:      "\x1b[8m",
        strikethrough: "\x1b[9m"
    }
};


middleConnector(() => {
    app.listen(PORT, (err) => {
        if(err) console.log('indx.js:: Error in listener: ',err);   //////////////////////
        console.log('\x1b[32mindx.js:: Server is running on http://localhost:'+PORT,'\x1b[0m')   //////////////////////
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
            console.log(`\x1b[34mIn send msg?status=2:\nfreind:${frendUsername} seder:${msg.sender} \x1b[0m`)
            msg.time.sent = dayjs().toDate(); 
            msg.status = 'S';
            addMsg(msg, frendUsername)
            .then(chatReturned => {
                console.log('indx.js:: .put : action2: ',   //////////////////////
                    // JSON.stringify(chatReturned)
                );
                console.log('.put: 2A')   //////////////////////
                let stats = searchRequests(msg.sender, frendUsername)
                // if(!stats) 
                try{
                    res.status(200).json({status: 0, chat: chatReturned});
                } catch(err){
                    console.log(`${text.color.red}In send msg?status=2: Error in sending response :: \n`,err,`${text.format.reset}`)
                }
            })
            .catch(err => {
                console.log('in .put action2.catch: ', err)   //////////////////////
            })
        } else {
            console.log('.get: B')   //////////////////////
            try{
                
                res.status(400).json({status: 3, msg: 'no user sent'});
            } catch(err){
                console.log(`${text.color.red}In send msg?status=2 inside else: Error in sending response:: \n`,err)
                
            }
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
let wait = 20;
class Request{
    constructor(username, req, res){
        this.username = username;
        this.req = req;
        this.res = res;
        this.timerId = null;
        this.responded = false;
    }
    wait(waitS){
        return new Promise((resolve) => {
            this.timerId = setTimeout(resolve, waitS*1000)
            // timerIds.push(id)
        })
    }
}
// let timerIds = []
let requests = []
// let responded = false;
chatRouter.post('/:username', (req, res) => {
    // const { username } = req.params
    console.log(`${text.color.yellow}getting req:: req.params: `,req.params,`${text.format.reset}`)   //////////////////////
    console.log(`${text.color.yellow}getting req:: req.body: `,req.body,`${text.format.reset}`)   //////////////////////
    const { username } = req.body
    // if (!username) {
    //     res.status(400).json({status: 3, msg: 'no username in body'});
    //     return;
    // }
    // requests.find((request) => request.username === username)
    let userRequest = requests.find((request) => request.username === username)
    if(!userRequest){
        console.log(`1User ${text.color.green}${username}${text.format.reset} not in requests -- adding it`);
        userRequest = new Request(username, req, res)
        userRequest.responded = false;   // created - and not responded yet
        requests.push(userRequest)
    } else {
        // If existing, clear old timer to replace with new wait
        if (userRequest.timerId) clearTimeout(userRequest.timerId);
        let i = requests.findIndex(r => r === userRequest);
        requests[i] = new Request(username, req, res)
        userRequest = requests[i]
        userRequest.responded = false;
    }
    requests.forEach((request,i) => console.log(`${text.color.brightCyan}request${i}.username: `,request.username,`${text.format.reset}`))
    userRequest.wait(wait).then(() => {
        // if (!userRequest.responded && !userRequest.res.headersSent) {
        userRequest.responded = true;
        console.log(`1Waited ${wait} secs for - sending the response to ${text.color.green}${username}${text.format.reset}`)   //////////////////////
        try{
            userRequest.res.status(204).json({status: 1})
        }catch(err){
            console.log(`${text.color.red}In chatter: : Error in sending response after wating:: \n`,err)
        }
        // }
        let index = requests.findIndex(r => r === userRequest);
        if (index !== -1) {
            clearTimeout(requests[index].timerId);
            requests.splice(index, 1);
            // timerIds.splice(index, 1);
        }
    })
    // else {
    //    res.status(200).json({status: 0})
    // }
})

function searchRequests(username, frendUsername){
    // let i = -1;
    // requests.forEach((request,i) => console.log(`request${i}.username: `,request.username))
    requests.forEach((request,i) => console.log(`${text.color.cyan}request${i}.username: `,request.username,`${text.format.reset}`))
    console.log(`${text.color.brightMagenta}searchReqs:: username (msgFrom): ',username,'-- -- frendUsername (msgTo): `,frendUsername,`${text.format.reset}`)
    let foundIndex = requests.findIndex(r => r.username === frendUsername)
    if(foundIndex !== -1){
        const r = requests[foundIndex];
        console.log(`${text.color.brightMagenta}searchReqs:: Request found, sending response (notification) -- the request was from (frend): `,r.username,`${text.format.reset}`)   //////////////////////
        clearTimeout(r.timerId);
        if (!r.responded && !r.res.headersSent) {
            
            console.log(`${text.color.brightMagenta}searchReqs:: Request found and not responded, sending response (notification) -- the request was from (frend): `,r.username,`${text.format.reset}`)   //////////////////////
            try{
                requests[foundIndex].res.status(200).json({status: 0, frend: username})
                requests.splice(foundIndex, 1); // remove the handled request
            } catch(err){
                console.log(`${text.color.red}In chatter: : Error in found req (someone sent msg):: \n`,err)
            }
        }
        // timerIds.splice(foundIndex, 1); // cleanup
        return 'res sent';
    } else {
        console.log(`${text.color.brightMagenta}searchReqs:: not found, Doing nothing`,`${text.format.reset}`)   //////////////////////
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