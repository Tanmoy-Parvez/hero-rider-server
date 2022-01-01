const express = require("express");
const cors = require("cors");
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// connect to the database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wh888.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("hero-rider");
        const usersCollection = database.collection("users");
        const packagesCollection = database.collection("packages");


        // save a sign up user
        app.post('/saveUser', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        // get sign in user
        app.get('/allUser', async (req, res) => {
            let { page, size } = req.query;
            if (!page) {
                page = 1
            }
            if (!size) {
                size = 4
            }
            const count = await usersCollection.find({}).count();
            const limit = parseInt(size)
            const skip = page * size;
            const result = await usersCollection.find({}, { limit: limit, skip: skip }).toArray();
            res.send({
                count,
                result
            });
        })

        // get an rider
        app.get('/saveUser/:email', async (req, res) => {
            const email = req.params.email;
            const result = await usersCollection.findOne({ email: email });
            res.json(result);
        })

        // get an rider
        app.get('/packages', async (req, res) => {
            const result = await packagesCollection.find({}).toArray();
            res.json(result);
        })

        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const result = await packagesCollection.findOne({ _id: ObjectId(id) });
            res.json(result);
        })


        // find specific user to update
        app.get("/allUser/:id", async (req, res) => {
            const id = req.params.id;
            const result = await usersCollection.findOne({ _id: ObjectId(id) });
            res.send(result);
        });
        // status update
        app.put("/allUser/:id", async (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: updateStatus.status,
                },
            };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
            );
            res.json(result);
        });


        // get an admin
        app.get('/saveUser/:email', async (req, res) => {
            const email = req.params.email;
            const result = await usersCollection.findOne({ email: email });
            let isAdmin = false;
            if (result?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.post('/create-checkout-session', async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                payment_method_types: ['card']
            });
            res.json({ clientSecret: paymentIntent.client_secret })

        })

    }

    finally {
        // await client.close();
    }
}
run().catch(console.dir)

// check the server is running or not
app.get("/", (req, res) => {
    res.send("Server running successfully");
});

app.listen(port, () => {
    console.log("listening on port", port);
});
