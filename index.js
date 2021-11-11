const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;


const cors = require('cors');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

//middlewere...
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uwk7a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
	try {
		await client.connect();
		console.log('connected to database')
		const database = client.db('bdHeadphonesHub');
		const productsCollection = database.collection('products');
		const productOrderItems = database.collection('orderItems');
		const usersCollection = database.collection('users');
		const usersReview = database.collection('review');


		/*---------------------------------------
					   GET POST STARTED
		 -------------------------------------- */



		// PURE UPDATE FOR ADMIN
		app.put('/users/admin', async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const updateDoc = { $set: { role: 'admin' } };
			const result = await usersCollection.updateOne(filter, updateDoc);
			res.json(result);
		})



		// CHECK WHETHER ADMIN
		app.get('/users/:email', async (req, res) => {
			const email = req.params.email;
			// console.log("query", req.query);
			// console.log("params", req.params);
			const query = { email: email }
			const user = await usersCollection.findOne(query);

			let isAdmin = false;
			if (user?.role === "admin") {
				isAdmin = true;
			}
			res.json({ admin: isAdmin })
		});


		// POST API FOR USERS
		app.post('/users', async (req, res) => {
			const user = req.body;
			const result = await usersCollection.insertOne(user);
			// console.log(user);
			res.json(result);
		})
		// UPSERT
		app.put('/users', async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const options = { upsert: true };
			const updateDoc = { $set: user };
			const result = await usersCollection.updateOne(filter, updateDoc, options);
			res.json(result);

		});


		// GET API for set data
		app.get('/products', async (req, res) => {
			const cursor = productsCollection.find();
			const products = await cursor.toArray();
			console.log("this is products", products);
			res.send(products);
		})
		// GET API for ordered data
		app.get('/orderItems', async (req, res) => {
			const cursor = productOrderItems.find();
			const orderItems = await cursor.toArray();
			// console.log("order items", orderItems);
			res.send(orderItems);
		})
		// GET API for REVIEW
		app.get('/review', async (req, res) => {
			const cursor = usersReview.find();
			const review = await cursor.toArray();
			console.log("order items", review);
			res.send(review);
		})

		// GET API for ordered data FOR SPECIFIC USER
		// app.get('/orderItems/:email', async (req, res) => {
		// 	const cursor = productOrderItems.find();
		// 	const orderItems = await cursor.toArray();
		// 	console.log("order items", orderItems);
		// 	res.send(orderItems);
		// })
		// GET API 
		app.get('/orderItems/:email', async (req, res) => {
			const email = req.params.email;
			const query = { email: email }
			const cursor = productOrderItems.find(query);
			const appointments = await cursor.toArray();
			res.json(appointments);
		});



		//GET SUINGLE ITEM
		app.get('/products/:id', async (req, res) => {
			const id = req.params.id;
			// console.log("Getiing specific id for emni", id);
			const query = { _id: ObjectId(id) };
			const service = await productsCollection.findOne(query);
			// console.log("from single item to check json i how", res.json(service))
			res.json(service);
		})
		//GET SUINGLE ITEM for order item
		app.get('/orderItems/:id', async (req, res) => {
			const id = req.params.id;
			// console.log("Getiing specific id for delete", id);
			const query = { _id: ObjectId(id) };
			const order = await productOrderItems.findOne(query);
			// console.log("from single item to check wether delete", res.json(service))
			console.log("Getiing deleted item show", order);
			res.json(order);
		})

		// POST API
		app.post('/products', async (req, res) => {
			const service = req.body;
			const result = await productsCollection.insertOne(service);
			res.json(result);
		});

		// POST API for order items
		app.post('/orderItems', async (req, res) => {
			const orderItems = req.body;
			const result = await productOrderItems.insertOne(orderItems);
			res.json(result);
		});

		// POST API FOR REVIEW
		app.post('/review', async (req, res) => {
			const review = req.body;
			console.log("hit the post api of REVIEW", review);
			const result = await usersReview.insertOne(review);
			res.json(result);
		});



		//DELETE API
		app.delete('/products/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await productsCollection.deleteOne(query);
			res.json(result);

		})


		//DELETE API for order items
		app.delete('/orderItems/:id', async (req, res) => {
			const id = req.params.id;
			// console.log("delete hitted", id)
			const query = { _id: ObjectId(id) };
			const result = await productOrderItems.deleteOne(query);
			res.json(result);

		})

		//UPDATE API
		app.put('/orderItems/:id', async (req, res) => {
			const id = req.params.id;
			const updatedUser = req.body;
			const filter = { _id: ObjectId(id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					productStatus: "Approved",
				},
			};
			const result = await productOrderItems.updateOne(filter, updateDoc, options);
			// console.log('update user', id)
			res.json(result);
		})


	}
	finally {
		// await client.close();
	}

}
run().catch(console.dir);

app.get('/', (req, res) => {
	res.json('bd-headphone-hub')
});

app.listen(port, () => {
	console.log('Running genius server on port', port);
})