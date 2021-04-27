'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg');
const superagent = require('superagent');
const cors = require('cors');
const methodOverride = require('method-override');
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
// const client = new pg.Client({
//     connectionString: process.env.DATABASE_URL,
//     //   ssl: process.env.LOCALLY ? false : {rejectUnauthorized: false}
// });
const PORT = process.env.PORT || 7000;


app.get('/home', (req, res) => {
    res.render('home');
});

app.post('/productbyprice', (req, res) => {
    let brand = req.body.brand;
    let greater = req.body.greater;
    let less = req.body.less;
    let url = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}&price_greater_than=${greater}&price_less_than=${less}`;
    superagent.get(url)
        .then(result => {
            let resultdata = result.body.map(data => {
                return new Productbyprice(data);
            });
            res.render('productbyprice', { data: resultdata });
        })
        .catch(err => {
            res.render('err', { err: err });
        });
});

app.get('/maybellineproducts', (req, res) => {
    let url = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline`;
    superagent.get(url)
        .then(result => {
            let resultdata = result.body.map(data => {
                return new AllProducts(data);
            });
            res.render('maybellineproducts', { data: resultdata });
        })
        .catch(err => {
            res.render('err', { err: err });
        });
});


app.post('/savetodb', (req, res) => {
    let sql = 'insert into makeup (productname, price , img, descrip) values ($1,$2,$3,$4) returning *;';
    let { productname, price, img, descrip } = req.body;
    let safeVals = [productname, price, img, descrip];
    client.query(sql, safeVals)
        .then(() => {
            res.redirect('/mycards');
        })
        .catch(err => {
            res.render('err', { err: err });
        });
});

app.get('/mycards', (req, res) => {
    let sql = 'select * from makeup';
    client.query(sql)
        .then(result => {
            res.render('mycards', { data: result.rows });
        })
        .catch(err => {
            res.render('err', { err: err });
        });
});

app.get('/productdetails/:id', (req, res) => {
    let sql = 'select * from makeup where id =$1';
    let safeVal = [req.params.id];
    client.query(sql, safeVal)
        .then(result => {
            res.render('productdetails', { data: result.rows });

        })
        .catch(err => {
            res.render('err', { err: err });
        });
});

/* <form action="/update/<%= data.id%>?_method=put" method="POST" > */
// (productname, price , img, descrip)

app.put('/update/:id', (req, res) => {
    let sql = 'update makeup set productname=$1,price=$2,img=$3,descrip=$4 where id =$5 ;';
    let { productname, price, img, descrip } = req.body;
    let safeVals = [productname, price, img, descrip, req.params.id];
    client.query(sql, safeVals)
        .then(() => {
            res.redirect(`/productdetails/${req.params.id}`);
        })
        .catch(err => {
            res.render('err', { err: err });
        });

});
app.delete('/delete/:id', (req, res) => {
    let sql = 'delete from makeup where id=$1;';
    let safeVals = [req.params.id];
    client.query(sql, safeVals)
        .then(() => {
            res.redirect(`/mycards`);
        })
        .catch(err => {
            res.render('err', { err: err });
        });

});




// (productname, price , img, descrip)
function Productbyprice(data) {
    this.productname = data.name;
    this.price = data.price;
    this.img = data.image_link;
    this.descrip = data.description;

}
// (productname, price , img, descrip)
function AllProducts(data) {
    this.productname = data.name;
    this.price = data.price;
    this.img = data.image_link;
    this.descrip = data.description;

}
client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`up to ${PORT}`);
        });
    });
