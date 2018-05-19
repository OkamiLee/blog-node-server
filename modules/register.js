var mysql = require("mysql");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var express = require('express');
var pushmsg = require('./push');
var app = express();
app.use(cookieParser());
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'liyong123.',
	database : 'node'
});
module.exports ={
	reg:(req,res)=>{
		var name = req.body.name;
		var newpass = req.body.newpass;
		var conpass = req.body.conpass;
		var cid = req.body.cid;
		var userid = new Date().getTime();
		var data = {password:newpass,clientid:cid,userid:userid,username:name}
		connection.connect((err)=>{
			if(err){
				return;
			}
		})
		connection.query("INSERT INTO register SET ?",data,(err,results,fields)=>{
			if(err) throw err;
			pushmsg.push({title:'欢迎来到极客空间',text:"这里有最权威的技术文章",content:"这里有最权威的技术文章",num:2})
			res.json({
		  		code:200,
		  		userid:userid
		  	});
		  	res.end();
		})
	},
	login:(req,res)=>{
		var obj = new Object();
		var name = req.body.name;
		var pass = req.body.pass;
		console.log(name,pass)
		var userId = "";
		connection.connect((err)=>{
			if(err){
				return;
			}
		})
		connection.query("SELECT * FROM register",(err,result,fields)=>{
			if(err) throw err;
			for(var i in result){
				if(result[i].username == name&&result[i].password==pass){
					obj = {code:200};
				}else{
					obj = {code:-1};
				}
			}
			res.json(obj);
			res.end();
		})
	}
}
