var mysql = require("mysql");

var pool =  mysql.createPool({
    host    : 'localhost',
    user    : 'root',
    password: 'liyong123.',
    database: 'node',
    multipleStatements: true
});

var query=function(sql,prame,callback){
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
        	if(prame){
        		conn.query(sql,prame,function(qerr,vals,fields){
	                //释放连接
	                conn.release();
	                //事件驱动回调
	                callback(qerr,vals,fields);
	            });
        	}else{
        		conn.query(sql,function(qerr,vals,fields){
	                //释放连接
	                conn.release();
	                //事件驱动回调
	                callback(qerr,vals,fields);
	            });
        	}
        }
    });
};

module.exports=query;

