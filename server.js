
/**
 * Module dependencies.
 */

var _ = require('underscore'),
  express = require('express'),
  routes = require('./routes'),
  mongoose = require('mongoose'),
  models = require('./models'),
  logger = require('./winston');

var app = module.exports = express();


// Configuration

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    res.send(500, { error: 'Something blew up!' });
  } else {
    next(err);
  }
}

function errorHandler(err, req, res, next) {
  res.status(500);
  logger.error(err);
  res.render('error', { error: err });
}

app.configure( function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(clientErrorHandler);
  app.use(errorHandler);
  app.use(app.router);
});

var mongo;

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  mongo = {
		"hostname":"localhost",
		"port":27017,
		"username":"",
		"password":"",
		"name":"",
		"db":"db360"
	};
});

app.configure('production', function(){
	app.use(express.errorHandler());
	//var env = JSON.parse(process.env.VCAP_SERVICES);
	//logger.info(env);
	//mongo = env['mongodb-1.8'][0]['credentials'];
	mongo = {
		"hostname": process.env.OPENSHIFT_MONGODB_DB_HOST,
		"port": parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT),
		"username": process.env.OPENSHIFT_MONGODB_DB_USERNAME,
		"password": process.env.OPENSHIFT_MONGODB_DB_PASSWORD,
		"name": process.env.OPENSHIFT_APP_NAME,
		"db": process.env.OPENSHIFT_APP_NAME
	};
});


// MongoDB

var generate_mongo_url = function(obj){
	obj.hostname = (obj.hostname || 'localhost');
	obj.port = (obj.port || 27017);
	obj.db = (obj.db || 'test');
	if(obj.username && obj.password){
		return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
	}else{
		return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
	}
};

var mongourl = generate_mongo_url(mongo);
//var mongourl = mongo['url'];

models.defineModels(mongoose, function() {
  app.Transaction = Transaction = mongoose.model('Transaction');
  db = mongoose.connect(mongourl);
});

var txs = [{
    "productId" : "228",
    "productName" : "motor chulo",
    "LoB" : 14,
    "policyId" : "234353",
    "agent" : {
        "agentId" : "909090",
        "node" : "AB100"
    },
    "transactionNumber" : 1,
    "creationDate" : new Date("2015-06-24T15:02:00.000Z"),
    "inceptionDate" : new Date("2015-07-24T00:00:00.000Z"),
    "endDate" : new Date("2016-07-24T00:00:00.000Z"),
    "operation" : "NB",
    "premium" : 893.4299999999999500,
    "currency" : "EUR",
    "policyHolder" : "1259",
    "objectOfRisk" : {
        "make" : "volkswagen",
        "model" : "passat",
        "plate" : "M-2803-WW",
        "engine" : "BIG 1.2",
        "melts_quickly" : true
    },
    "covers" : [ 
        {
            "name" : "fire",
            "id" : 82,
            "limit" : 30000.0000000000000000,
            "excess" : 0.0000000000000000
        }, 
        {
            "name" : "3rd party",
            "id" : 24,
            "limit" : 9000000.0000000000000000,
            "excess" : 0.0000000000000000,
            "clauses" : [ 
                {
                    "text" : "not covered if drunk"
                }
            ]
        }
    ]
},
{
    "productId" : "423",
    "productName" : "hogar gar",
    "policyId" : "099903949532434",
    "agentId" : "080808",
    "transactionNumber" : 1,
    "LoB" : 22,
    "creationDate" : new Date("2014-11-23T15:12:00.000Z"),
    "inceptionDate" : new Date("2014-12-10T00:00:00.000Z"),
    "endDate" : new Date("2015-12-10T00:00:00.000Z"),
    "operation" : "NB",
    "premium" : 910.0000000000000000,
    "currency" : "EUR",
    "policyHolder" : "1259",
    "objectOfRisk" : {
        "address" : "Calle MiCalle numero 23, 3ºB Madrid",
       "type_of_Construction" : "wood",
        "year_of_construction" : 1999,
        "constructionValue" : {
            "amount" : 200000.0000000000000000,
            "currency" : "EUR"
        },
        "contentValue" : {
            "amount" : 90000.0000000000000000,
            "currency" : "EUR"
        }
    },
    "covers" : [ 
        {
            "name" : "fire",
            "id" : 82,
            "limit" : 30000.0000000000000000,
            "excess" : 0.0000000000000000
        }, 
        {
            "name" : "theft",
            "id" : 94,
            "limit" : 1000.0000000000000000,
            "excess" : 0.0000000000000000
        }, 
        {
            "name" : "public liability",
            "id" : 24,
           "limit" : 90000000.0000000000000000,
            "excess" : 0.0000000000000000,
            "clauses" : [ 
                {
                    "text" : "only applicable for water and  fire accidental damages"
                }
            ]
        }
    ]
}];

Transaction.collection.drop(function (err) {
    if (err) { console.log('Drop ' + err); }
});

var tran;
txs.forEach(function (tx){
    tran = new Transaction();
    Transaction.collection.insert(tx, function (err) {
        if (err) { console.log('Insert ' + err); }
    });
});
_





app.get('/api/contracts', routes.getContracts);
app.get('/api/contracts/:contractId', routes.getSingleContract);

// Start server

app.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000, process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1", function(){
  logger.info("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
