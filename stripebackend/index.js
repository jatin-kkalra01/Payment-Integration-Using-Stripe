const express = require('express')
const cors = require('cors')

const stripe = require('stripe')('sk_test_51PAHUYSFBYiXjSgXqH5V4MeIusjPkUdpViXMXyiUbfKjsh4Z4vptsnwNdUtB6QgSenyhnKbGwxH7rE8TeLKIhDI700Qi7kK8wQ')
// const uuid = require('uuid')

const { v4: uuidv4 } = require('uuid');
// uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

const app = express();

//middlewares
app.use(express.json())
app.use(cors())


//routes
app.get('/', (req, res)=>{
    res.send("hello, world!!");
})

app.post('/payment', (req, res)=> {

    const {product, token} = req.body
    console.log('PRODUCT: ', product)
    console.log('PRICE', product.price)
    const idempotencyKey = uuidv4()

    return stripe.customers
        .create({
            email: token.email,
            source: token.id
        }).then(customer => {
            stripe.charges.create({
                amount: product.price * 100,
                currency: 'inr',
                customer: customer.id,
                receipt_email: token.email,
                description: `Purchase of ${product.name}`
            }, {idempotencyKey})
        })
        .then( (result) => {
            console.log('RESULT FROM STRIPE: ', result);
            res.status(200).json({
                success: true,
                message: "Payment Successful"
            });
        })
        .catch( (err) => {
            console.log("Error is: ", err)
            res.status(500).json({
                success: false,
                message: "Payment failed"
            })
        })
})

// listen
app.listen(8282, ()=>{
    console.log("Listening at port 8282");
})