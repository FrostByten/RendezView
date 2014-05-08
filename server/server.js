//-----------------Includes----------------
var http = require('http'),
	url = require('url'),
	path = require('path'),
	qs = require('querystring'),
	fs = require('fs'),
	db = require('mysql'),
	socketio = require('socket.io'),
	nodemailer = require('nodemailer');
	
//----------------Global Vars--------------
var httpport = 80,
	sqlport = 3306,
	connection = db.createConnection({
		host : '162.156.5.173',
		user : 'admin',
		password : 'hype41',
	});

//-------------------Main------------------
console.log("Starting HTTP Server on port: " + httpport);
connection.connect();
var server = http.createServer(onRequest).listen(httpport),
	io = socketio.listen(server, {log: false}),
	mail = nodemailer.createTransport("SMTP", {
		service: "Gmail",
		auth: {
			user: "rendezview.server@gmail.com",
			pass: "hype4122"
		}
	});

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
	if(pathname.search("mail?")!=-1)
	{
		sendMail(pathname.split("/")[1], pathname.split("/")[2]);
		return;
	}
	if(pathname.search("makevalid?")!=-1)
	{
		makeValid(pathname.split("/")[1], response);
		return;
	}
	if(pathname.search("doreg?")!=-1)
	{
		var list = pathname.split("/");
		queryRegister(list[1], list[2], list[3], list[4], list[5]);
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<script>window.location.replace(\"../../../../../../../../../../../index.html#regConfirmPage\");</script>");
		response.end();
		return
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

function makeValid(name, response)
{
	connection.query("UPDATE users SET validated=1 WHERE userID = \"" + name + "\"");
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("<script>window.location.replace(\"../../index.html#emailValidated\");</script>");
	response.end();
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
	
	var name = pathname.split("/")[1];
	
	connection.query("use rendezview");
	connection.query("SELECT * FROM users WHERE userid = \"" + name + "\"", function(err, rows, fields)
	{
		if(err)
		{
			console.log("SQL Error: " + err);
			return;
		}
		var row = rows[0];
		
		if(row==null||row.userID=='null')
		{
			write404(response);
			console.log("Validation denied... No such user: " + name);
		}
		else
		{
			if(row.validated==1)
			{
				write404(response);
				console.log("Validation denied... User already validated: " + name);
			}
			else
			{
				console.log("Validation approved... Updating database");
				response.writeHead(200, {"Content-Type": "text/html"});
				response.write("<script>window.location.replace(\"localhost/" + name + "/makevalid?\");</script>");
				response.end();
			}
		}
	});
}

function tryLogin(pathname, response)
{
	var list = pathname.split("/");
		
	console.log("\n\nLOGIN request received\n");
	connection.query("use rendezview");
	connection.query("SELECT * FROM users WHERE userID=\"" + list[1] + "\"", function(err, rows, fields)
	{
		if(err)
			console.log("SQL ERROR: " + err);
		
		var row = rows[0];
		
		if(row.userID=='null'||row.userID==null)
		{
			console.log("Login denied... No such user: " + list[1]);
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"../../../index.html#loginIncorrect\");</script>");
			response.end();
			return;
		}
		if(row.password!=list[2])
		{
			console.log("Login denied... Incorrect password: " + list[2]);
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"../../../index.html#loginIncorrect\");</script>");
			response.end();
			return;
		}
		if(!row.validated)
		{
			console.log("Login denied... User not validated: " + list[1]);
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"../../../index.html#loginNotVerified\");</script>");
			response.end();
			return;
		}
		console.log("Login approved... User: " + list[1]);
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<script>window.location.replace(\"../../../index.html#mainPage\");</script>");
		response.end();
	});
}

function tryRegister(pathname, response)
{
	var data = pathname.split("/"),
		firstname = data[1],
		lastname = data[2],
		sid = data[3],
		email = data[4],
		password = data[5];
	
	console.log("\n\nREGISTER request received\n");	
	
	connection.query("SELECT * FROM users WHERE userID=\"" + sid + "\"", function(err, rows, fields)
	{
		if(rows!=undefined)
		{
			console.log("Registration denied... User already exists: " + sid);
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"../../../../../../index.html#noReg\");</script>");
			response.end();
		}
		else
		{
			console.log("Registration approved... Updating database");
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"localhost/" + sid + "/" + lastname + "/" + firstname + "/" + email + "/" + password + "/doreg?\");</script>");
			response.end();
		}
	});
}

function queryRegister(firstname, lastname, userid, email, password)
{
	var connection = db.createConnection({
		host : '162.156.5.173',
		user : 'admin',
		password : 'hype41',
	});
	
	connection.query("use rendezview");
	
	connection.query("INSERT INTO users (userID, lastName, firstName, email, password, validated) VALUES (\'" + userid + "\', \'" + lastname + "\', \'" + firstname + "\', \'" + email + "\', \'" + password + "\', 0);", function(err, response)
	{
		if(err)
			console.log(err);
	});
	
	sendMail(userid, email);
}

function query(input, row)
{
	connection.query("use rendezview");
	
	connection.query(input, value=function(err, rows, fields)
	{
		if(err)
		{
			console.log("SQL SYNTAX ERROR: " + err);
		}
	});
	
	return value;
}

function sendMail(name, email)
{
	console.log("\n\nMAIL request received\n");
	
	mail.sendMail({
			from: "rendezview.server@gmail.com",
			to: email + "@my.bcit.ca",
			subject: "Welcome to RendezView",
			text: "Thank you for joining RendezView!\n\nYour registration is complete, you may now verify your account by clicking the following link:\n\n  162.156.5.173:84/" + name + "/validate?"
		}, function(error, response)
		{
			if(error)
				console.log("MAIL denied, STMP server error: " + error);
			else
				console.log("MAIL approved, message sent to: " + email + "@my.bcit.ca");
		});
}

io.sockets.on('connection', function(socket)
{
	var address = socket.handshake.address;
	console.log("Socket connection established, client connected: " + address.address + ":" + address.port);
});

io.sockets.on('disconnect', function(socket)
{
	var address = socket.handshake.address;
	console.log("Socket connection lost, client disconnected: " + address.address + ":" + address.port);
});

function SQLError(err)
{
	if(err)
		console.log("SQL Error: " + err);
}