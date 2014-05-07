//-----------------Includes----------------
var http = require('http'),
	url = require('url'),
	path = require('path'),
	qs = require('querystring'),
	fs = require('fs'),
	db = require('mysql');
	
//----------------Global Vars--------------
var httpport = 80,
	sqlport = 3306;

//-------------------Main------------------
console.log("Starting HTTP Server on port: " + httpport);
http.createServer(onRequest).listen(httpport);

//-----------------Functions---------------
function onRequest(request, response)
{
	if(request.method === "POST")
		parseJSON(request, response);
	else //request method is GET or HEAD
		serve(request, response);
}

function parseJSON(request, response)
{
	var data = "";
	
	console.log("POST Request received from: " + request.connection.remoteAddress);
	
	request.on("data", function(chunk)
	{
		data += chunk;
	});
		
	request.on("end", function()
	{
		console.log("raw:  " + data);
		console.log("\n---------------------\n");
		var json = qs.parse(data);
		console.log("json: " + json);
		console.log("\n---------------------\n");
	});
}

function serve(request, response)
{
	console.log("GET Request received from: " + request.connection.remoteAddress + " for " + request.url);
	
	//parse the path from the url and append it to the current working directory
	var pathname = url.parse(request.url).pathname,
		filename = path.join(process.cwd(), pathname);
		
	if(pathname.search("validate?")!=-1)
	{
		validate(pathname, response);
		return;
	}
	if(pathname.search("login?")!=-1)
	{
		tryLogin(pathname, response);
		return;
	}
	if(pathname.search("register?")!=-1)
	{
		tryRegister(pathname, response);
		return;
	}
	
	fs.exists(filename, function(exists)
	{
		if(!exists)
		{
			write404(response);
			return;
		}
		if(fs.statSync(filename).isDirectory())
			filename += '/index.html'; //if the requested path is a directory, default to index.html
		
		fs.readFile(filename, "binary", function(err, file)
		{
			if(err)
				write500(err, response);
			else
				writeFile(file, response);
		});
	});
}

function write404(response)
{
	response.writeHead(404, {"Content-Type": "text/plain"});
	response.write("404 : File/Directory Not Found\n");
	response.end();
}

function write500(err, response)
{
	response.writeHead(500, {"Content-Type": "text/plain"});
	response.write(err + "\n");
	response.end();
}

function writeFile(file, response)
{
	response.writeHead(200);
	response.write(file, "binary");
	response.end();
}

function validate(pathname, response)
{
	console.log("\n\nVALIDATE request received\n");
	
	var name = pathname.split("/")[1],
		row = query("SELECT * FROM users WHERE userid=\"" + name + "\"", 0);
	
	if(row==null)
		write404(response);
	else
	{
		if(row[0].validated==1)
			write404(response);
		else
		{
			query("UPDATE users SET validated = 1 WHERE userid = \"" + name + "\";", 0);
			response.writeHead(200, {"Content-Type": "text/plain"});
			response.write("Email validated.\n You may now log on with your username.");
			response.end();
		}
	}
}

function tryLogin(pathname, response)
{
	var list = pathname.split("/"),
		status = checkLogin(list[1], list[2]);
		
	if(status==0)
	{
	
	}
		//success, assign id, allow access
	if(status==1|status==2)
	{
	
	}
		//failure, wrong username/password
	if(status==3)
	{
	
	}
		//failure, not validated
}

function checkLogin(username, password)
{
	var row = query("SELECT * FROM users WHERE userID=\"" + username + "\"", 0);

	console.log("\n\nLOGIN request received\n");
	
	if(row==null)
		return 1; //wrong username
	if(row.password!=password)
		return 2; //wrong password
	if(!row.validated)
		return 3; //not validated
	return 0; //success
}

function tryRegister(pathname, response)
{
	var data = pathname.split("/"),
		firstname = data[1],
		lastname = data[2],
		sid = data[3],
		email = data[4],
		password = data[5],
		row = query("SELECT * FROM users WHERE userID=\"" + sid + "\"", 0);
		
	console.log("\n\nREGISTER request received\n");	
	
	if(row!=null)
	{
	
	}
		//failure: user already exists
	else
	{
		query("INSERT INTO users VALUES (\"" + sid + "\", \"" + lastname + "\", \"" + email + "\", \"" + password + "\", 0);", 0);
		//success: notify client
	}
}

function query(input, row)
{
	var value;
	var connection = db.createConnection({
		host : '162.156.5.173',
		user : 'admin',
		password : 'hype41',
	});
	
	connection.connect(function(err)
	{
		if(err)
			console.log("SQL Error on: " + input);
	});
	
	connection.query("use rendezview");
	connection.query(input, function(err, rows, fields)
	{
		value = rows[row];
	});
	connection.end();
	
	return value;
}
