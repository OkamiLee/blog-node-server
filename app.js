var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var fs = require('fs');
var cheerio = require('cheerio');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var schedule = require('node-schedule');

var pushmsg = require('./modules/push');
var register = require('./modules/register');
var query = require('./modules/mysql');
var app = express();

app.use(bodyParser.json({limit: '50mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({limit: '50mb', extended: true })); // for parsing application/x-www-form-urlencoded

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.post('/upload',(req,res)=>{//上传图片接口
	var imgData = req.body.base;
	for(var i in imgData){
		var dates = new Date().getTime();
	    var base64Data = imgData[i].replace(/^data:image\/\w+;base64,/, "");
	    var dataBuffer = new Buffer(base64Data, 'base64');
	    var path = __dirname+"/public/"+dates+".jpg";
	    fs.writeFile(path, base64Data,'base64', function (err) {  
        	if(err){
        		console.lgo(err)
        	}
    	});
	}
	res.json({
  		code:200
  	});
  	res.end();
})
app.post('/register',(req,res)=>{//用户注册接口
	register.reg(req,res)
})
app.post('/login',(req,res)=>{//用户登录接口
	register.login(req,res)
})
app.post('/news',(req,res)=>{
	const size = req.body.size;
	const pageNum = req.body.num;
	query("SELECT * from test limit "+pageNum*size+","+size,function(err,vals,fields){
	    if(err) throw err;
	    var obj = [];
	    for(var i in vals){
	    	obj.push({
	    		time:vals[i].time,
	    		title:vals[i].title,
	    		content:vals[i].content,
	    		time:vals[i].time,
	    		topimg:vals[i].imgs.split(',')[0],
	    		auther:vals[i].auther,
	    		userimg:vals[i].userimg,
	    		imgs:vals[i].imgs.split(',')
	    	})
	    }
	    if(vals.length<10){
	    	res.json({
				code:200,
				data:obj,
				status:false
			})
	    }else{
	    	res.json({
				code:200,
				data:obj,
				status:true
			})
	    }
		res.end()
	});
	
})

schedule.scheduleJob('50 59 11 * * *', function(){//每天12点定时推送
	pushmsg.push({title:'到点了',text:"该吃饭了",content:"今天你还没看我呢",num:2})
}); 



var newsNum = 1;
var rule = new schedule.RecurrenceRule();
rule.second = 5;

//test(newsNum)
function test(newsNum){
	console.log(newsNum)
	http.get('http://120.76.205.241:8000/news/qihoo?kw=%E7%99%BD&pageToken='+newsNum+'&site=qq.com&apikey=nAg1XwoIFSZAa7SSIFB2g1P1d25vR7mQq3pk66GyJidmZ8iJUpuNZ0hXsqkxbI3r',function(req,res){  
	    var html='';  
	    req.on('data',function(data){  
	        html+=data;  
	    });  
	    req.on('end',function(){ 
	    	html = JSON.parse(html);
	        for(var i in html.data){
	        	var textObj = {};
	        	textObj.title = html.data[i].title;
	        	textObj.content = html.data[i].content;
	        	if(html.data[i].imageUrls!=null&&html.data[i].imageUrls!=''){
	        		textObj.imgs = html.data[i].imageUrls.join(',');
	        	}
	        	textObj.url = html.data[i].url;
	        	textObj.auther = html.data[i].posterScreenName;
	        	query("INSERT INTO test SET ?",textObj,function(err,vals,fields){
				    if(err) throw err;
				    newsNum++;
				    test(newsNum)
				    console.log('写入成功');
				});
	        }
	    });  
	});
}








app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(7000,'192.168.0.102',function(){
	console.log('server is running')
})
module.exports = app;