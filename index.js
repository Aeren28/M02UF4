#!/bin/node

//#!/usr/bin/env node

const http = require('http');
const { MongoClient } = require('mongodb');

//Connection URL
const url = 'mongodb://127.0.0.1:27017';

const client = new MongoClient(url);

// Database Name

const dbName = 'enbuscadeabascal';

let db;

async function db_connect() {

  // Use connect method to connect to the server

  await client.connect();

  console.log('Connected successfully to server');

  db = client.db(dbName);

  //const collection = db.collection('documents');

  return 'Conectando a la base de datos MongoDB';

}

db_connect()
	.then(info => console.log(info))
	.catch(msg => console.error(msg));


function send_characters (response){

	let collection = db.collection('characters');

	collection.find({}).toArray().then(characters => {
		let names=[];

		for (let i = 0; i < characters.length; i++){
			names.push( characters[i].name );
		}

		console.log(names);
		
		response.write(JSON.stringify(names));
		response.end();
	});
	
}


let http_server = http.createServer(function(request, response){
	if(request.url == "/favicon.ico"){
		return;
	}

	console.log(request.url);
	
	if (request.url == "/characters"){
		send_characters(response);
	}
	else{
		 response.write("Página principal");
		 response.end();
	}

	/* console.log(collection);
	   console.log("Alguien se conecta");*/
});

http_server.listen(6969);

