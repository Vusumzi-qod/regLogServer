import express from 'express';
import knex from 'knex';
import bcrypt from 'bcrypt-node';
import cors from 'cors';

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'admin',
    database : 'postgres'
  }
});


const app = express();


// Middleware:

app.use(express.json());
app.use(cors());


// Endpoints:

app.get('/', (req, res) => {
    res.json("Welcome to Our Application!")
})


app.post('/register', (req, res) => {
    const {name, email, age, id, password, city} = req.body;

    bcrypt.hash(password, null, null, function(err, hash) {
        db.transaction(trx => {
            trx.insert({
                name, email, age, city
            })
            .into('users')
            .returning('email')
            .then(loginEmail => {
                trx.insert({
                    email: loginEmail[0].email,
                    hash: hash
                })
                .into('login')
                .then(reponse => {
                    res.json({name, email, age, id, city})
                })
            })
            .then(trx.commit)
            .catch(error => {
                res.json("Sorry we couldn't register you.")
            })
        }).catch(err => {
            res.json("Something went wrong.")
        })
    });
      
    //   // Load hash from your password DB.
    //   bcrypt.compare("veggies", hash, function(err, res) {
    //       // res = false
    //   });


    // if(!name || !email || !age || !password || !city){
    //     res.status(400).json("Bad form submission");
    // }
    // else{
    //     db('users').insert({
    //         id: id,
    //         name: name,
    //         email: email,
    //         age: age,
    //         city: city
    //     }).then(response => {
    //         console.log(response);
    //         res.json("Registered :)")
    //     }).catch(err => {
    //         console.log(err)
    //         res.status(500).json("Internal Server Error")
    //     })
    // }
})

app.post('/login', (req, response) => {
    const {email, password} = req.body;
    console.log(email, password);
    db.select('hash').from('login').where({email: email})
    .then(data => {        
          // Load hash from your password DB.
      bcrypt.compare(password, data[0].hash, function(err, res) {
          if(res){
              response.json("You are in my dude")
          }
          else{
              response.json("You're forbiden my dude");
          }
      });
    });


    // if(email === database.users[0].email && password === database.users[0].password){
    //     res.json("You are logged in!")
    // }
    // else{
    //     res.status(401).json("Wrong details provided!!!!")
    // }
})

app.delete('/delete/:userId', (req, res) => {
    const {userId} = req.params;
    const {email} = req.body;

    db.transaction(trx => {
        trx.where({id: userId}).del().from('users').then(response => {
            if(response){
                trx.where({email: email}).del().from('login').then(response => {
                    res.json("Good bye my Dude");
                })
                .then(trx.commit)
                .catch("Couldn't delete profile, please try again.")
            }else{
                res.json("Couldn't Delete Your Profile. Yeah Yuh!")
            }
        })
    })

    // if(parseInt(userId) === database.users[0].id){
    //     database.users.splice(0);
    //     res.status(204).json("We are sad to see you go!")
    // }
    // else{
    //     res.json("No such user found!");
    // }
})

// Server listening to port
app.listen(9000, (err) => {
    if(err){
        console.log("something went south");
    }else{
        console.log(`Server running on PORT: 9000`);
    }
    
})