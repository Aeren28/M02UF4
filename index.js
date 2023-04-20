#!/bin/node

//#!/usr/bin/env node

const http = require('http');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const qs = require('querystring');

//Connection URL
const url = 'mongodb://127.0.0.1:27017';

const client = new MongoClient(url);

// Database Name

const dbName = 'enbuscadeabascal';

let db;
let collection;

async function db_connect() {

  // Use connect method to connect to the server

  await client.connect();

  console.log('Connected successfully to server');

  db = client.db(dbName);

  //const collection = db.collection('documents');

  return 'Conectando a la base de datos MongoDB';

}

db_connect()

	.then(console.log)
	.catch(console.error);


function send_characters (response){

	collection = db.collection('characters');

	collection.find({}).toArray().then(characters => {

		let characters_name=[];

		for (let i = 0; i < characters.length; i++){
		
			characters_name.push( characters[i].name );
		}

		console.log(names);
		
		response.write(JSON.stringify(characters_name));
		response.end();

	});
	
}

function send_age(response, url){

	if(url.length < 3) {
	
		response.write("ERROR: Edad errónea");
		response.end();
		
		return;
	} 

collection = db.collection('characters');

collection.find({ "name": url[2] }).project({ _id: 0, age: 1}).toArray().then(character => {
	
	console.log(character);

	if (character.length == 0){
		
		response.write("ERROR: Edad errónea");
		response.end();

		return;

	}

	response.write(JSON.stringify(character[0]));
	response.end();

	});
}

function send_character_items ( response, url){

	let name = url[2].trim();

	if (name == ""){
	
		response.write("error, URL not accepted");
		response.end();

		return;
	}

	let collection = db.collection("characters");
	collection.find({"name": name}).project({_id: 0, id_character: 1}).toArray().then(characterID =>{
		
		console.log(characterID);

		if ( characterID.length != 1){
			
			response.write("error, el personaje " + name + " no existe");
			response.end();

			return;
		
		}
	
		let collection = db.collection("character_items");
		collection.find({"id_character": characterID[0].id_character}).project({_id: 0, id_item1}).toArray().then(itemsID =>{
			
			console.log(itemsID);

			if(ids.length == 0){
				
				response.write("[]");
				response.end();

				return;
			}
			
			let collection = db.collection("item");
			let ids= [];

			itemsID.forEache(element => ids.push(element.id_items));
			
			collection.find({"id_item": {$in:ids} }).project({_id: 0, item: 1}).toArray().then(items_name => {
				
				let names = [];

				items_name.forEach( item => names.push(item.item));

				response.write(JSON.stringify(names));
				response.end();

				return;
			});
		});
	});
}

function send_items(response, url_split){
	
	if(url.length >= 3){

		send_character_items (response, url);
		
		return;
	}

	collection = db.collection('items');

	collection.find({}).toArray().then(items => {

	console.log(items);

	let items_name = [];

	for ( let i = 0; i < items.length; i++){
		items_name.push(items[i].item);
	}

		response.write(JSON.stringify(items_name));
		response.end();
	});
}

function send_weapons (response){

	collection = db.collection('weapons');

	collection.find({}).toArray().then(weapons => {
		
		console.log(weapons);

		let weapons_name = [];

		for (let i = 0; i < weapons.length; i++){
			weapons_name.push(weapons[i].weapon);
		}

		response.write(JSON.stringify(weapons_name));
		response.end();
	});
}

function send_Character_Data(response, id_character) {

	collection = db.collection('characters');
	
	collection.find({ "id_character": Number(id_character) }).project({ _id: 0 }).toArray()
		.then(character => {
			response.write(JSON.stringify(character));
			response.end();
		});	
}

function insert_character (request, response){
	
	if (request.method != "POST"){
		
		response.write("ERROR: Formulario no enviado");
		response.end();

		return;
	}

	let data = "";

	request.on('data', character_chunk => data += character_chunk);
	request.on('end', () => {
		
		console.log(data);

		let info = qs.parse(data);

		console.log(info);

		let collection = db.collection("characters");

		if (info.name == undefined){
		
			response.write("ERROR: Nombre no definido");
			response.end();

			return;
		}

		if (info.age == undefined){
			
			response.write("ERROR: Edad no definida");
			response.end();

			return;
		}

		let insert_info = {
			
			name: info.name,
			age: parseInt(info.age)
		};

		collection.insertOne(insert_info);

		response.write("Nuevo personaje insertado correctamente: " + insert_info.name);
		response.end();
	});
}

let http_server = http.createServer(function(request, response){
	
	if(request.url == "/favicon.ico"){
		return;
	}	

	console.log("Se conecto");

	let url = request.url.split("/");
	let params = request.url.split("?");

	switch (url[1]) {
	
	case "age":
		send_age(response, url);
		break;

	case "characters":
		send_characters(response);
		break;
	
	case "items":
		send_items(response, url);
		break;

	case "weapons":
		send_weapons(response);
		break;

	case "character_form":
		insert_character(request, response);
		break;

	default:
	
		if (params[1]) {
			let parameter = params[1].split("=");
			let id_character = parameter[1];
			console.log(id_character);

			send_Character_Data(response, id_character);
			return;
		}

		fs.readFile("index.html", function(err, data){
		
		if (err){
			
			console.error(err);
			
			response.writeHead(404, {"Content-Type":"text/html"});
			response.write("Error 404: el archivo no está");
			response.end();

			return;
	
		}

		response.writeHead(200, {"Content-Type":"text/html"});
		response.write(data);

		response.end();
	
		});

	}

}).listen(7887);

