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
var httpport = 84,
	sqlport = 3306,
	connection = db.createConnection({
		host : 'localhost',
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
	
	//parse the path from the url and append it to the current working directory
	var pathname = url.parse(request.url).pathname,
		filename = path.join(process.cwd(), pathname),
		list = pathname.split("/");
		
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
		sendMail(list[1], list[2]);
		return;
	}
	if(pathname.search("makevalid?")!=-1)
	{
		makeValid(list[1], response);
		return;
	}
	if(pathname.search("doreg?")!=-1)
	{
		queryRegister(list[1], list[2], list[3], list[4]);
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<script>window.location.replace(\"../../../../../../../../../../../index.html#regConfirmPage\");</script>");
		response.end();
		return;
	}
	if(pathname.search("deletefriend?")!=-1)
	{
		deleteFriend(list[1], list[2], response);
		return;
	}
	if(pathname.search("addfriend?")!=-1)
	{
		addFriend(list[1], list[2], response);
		return;
	}
	if(pathname.search("getfriends?")!=-1)
	{
		getFriends(list[1], response);
		return;
	}
	if(pathname.search("confirmfriend?")!=-1)
	{
		confirmFriend(list[1], list[2], response);
		return;
	}
	if(pathname.search("makefriends?")!=-1)
	{
		makefriends(list[1], list[2], response);
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

function makefriends(current, toadd, response)
{
	connection.query("use rendezview");
	connection.query("INSERT INTO friends (userid_a, userid_b, confirmed) VALUES (\'" + current + "\', \'" + toadd + "\', 0);");
	
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("<script>window.location.replace(\"../../../../../index.html#friendsPage\");</script>");
	response.end();
}

function confirmFriend(current, toadd, response)
{
	connection.query("use rendezview");
	connection.query("UPDATE friends SET confirmed=1 WHERE userid_a=\"" + toadd + "\" AND userid_b=\"" + current + "\";");
	
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(<script>window.location.replace(\"../../../../../../../../index.html#friendsPage\");</script>");
	response.end();
}

function deleteFriend(current, todelete, response)
{
	console.log("DELETE FRIEND request recieved");
	console.log(current + " wants to remove " + todelete + " as a friend");
	console.log("Deletion Approved...");
	
	connection.query("use rendezview");
	connection.query("DELETE FROM friends WHERE userid_a = \"" + current + "\" AND userid_b = \"" + todelete + "\";");
	connection.query("DELETE FROM friends WHERE userid_a = \"" + todelete + "\" AND userid_b = \"" + current + "\";");
	
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("<script>window.location.replace(\"../../../../../../../../../../../index.html#friendsPage\");</script>");
	response.end();
}

function addFriend(current, toadd, response)
{
	console.log("ADD FRIEND request recieved");
	console.log(current + " wants to add " + toadd + " as a friend");
	
	connection.query("user rendezview");
	connection.query("SELECT * FROM users WHERE userid = \"" + toadd + "\";", function(err, rows, fields)
	{
		if(err)
			console.log("SQL Error: " + err);
		
		if(rows==null||rows==undefined)
		{
			console.log("Add denied: User " + toadd + " does not exist...");
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"../../../../../../../index.html#friendNotExistPage\");</script>");
			response.end();
		}
	});
	
	//check that we don't just have to confirm it
	connection.query("SELECT * FROM friends WHERE userid_a=\"" + toadd + "\" AND userid_b=\"" + current + "\"", function(err, rows, fields)
	{
		if(err)
			console.log("SQL Error: " + err);
		
		if(rows!=null&&rows!=undefined)
		{
			console.log("Add approved: Confirming friendship...");
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"162.156.5.173/" + current + "/" + toadd + "/confirmfriend?");
			response.end();
		}
	});
	
	//check that they're not already friends
	connection.query("SELECT * FROM friends WHERE userid_a=\"" + current + "\" AND userid_b=\"" + toadd + "\";", function(err, rows, fields)
	{
		if(err)
			console.log("SQL Error: " + err);
		
		if(rows==null||rows==undefined)
		{
			console.log("Add approved: Creating friendship...");
			
			response.writeHead(200m {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"162.156.5.173/" + current + "/" + toadd + "/makefriends?\");</script>");
			response.end();
		}
		else
		{
			console.log("Add denied: friendship already exists...");
			
			response.writeHead(200m {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"../../../../../../../index.html#alreadyFriendsPage\");<\script>");
			response.end();
		}
	});
}

function getFriends(userid, response)
{
	
}

function makeValid(name, response)
{
	connection.query("UPDATE users SET validated=1 WHERE userID = \"" + name + "\"");
	response.writeHead(200, {"Content-Type": "text/html"});
	
    response.write("<script>window.location.replace(\"../../../index.html#emailValidated\");</script>");
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
		}
		else
		{
			if(row.validated==1)
			{
				write404(response);
			}
			else
			{
				response.writeHead(200, {"Content-Type": "text/html"});
				response.write("<script>window.location.replace(\"162.156.5.173/" + name + "/makevalid?\");</script>");
				response.end();
			}
		}
	});
}

function tryLogin(pathname, response)
{
	var list = pathname.split("/");
		
	connection.query("use rendezview");
	connection.query("SELECT * FROM users WHERE userID=\"" + list[1] + "\"", function(err, rows, fields)
	{
		if(err)
			console.log("SQL ERROR: " + err);
		
		if(rows == null || rows == undefined)
		{
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"../../../index.html#loginIncorrect\");</script>");
			response.end();
			return;
		}
        
        var row = rows[0];
        
        if(row == null || row == undefined)
        {
            response.writeHead(200, {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"../../../index.html#loginIncorrect\");</script>");
			response.end();
			return;
        }
        
		if(row.password!=list[2])
		{
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"../../../index.html#loginIncorrect\");</script>");
			response.end();
			return;
		}
		if(!row.validated)
		{
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"../../../index.html#loginNotVerified\");</script>");
			response.end();
			return;
		}

		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<script>window.location.replace(\"../../../index.html#mainPage\");</script>");
		response.end();
	});
}

function tryRegister(pathname, response)
{
	var data = pathname.split("/"),
		name = data[1],
		sid = data[2],
		email = data[3],
		password = data[4];
	
	connection.query("SELECT * FROM users WHERE userID=\"" + sid + "\"", function(err, rows, fields)
	{
		if(rows!=undefined)
		{
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"../../../../../../index.html#noReg\");</script>");
			response.end();
		}
		else
		{
			response.writeHead(200, {"Content-Type": "text/html"});
			response.write("<script>window.location.replace(\"162.156.5.173/" + sid + "/" + name + "/" + email + "/" + password + "/doreg?\");</script>");
			response.end();
		}
	});
}

function queryRegister(name, userid, email, password)
{
	var connection = db.createConnection({
		host : 'localhost',
		user : 'admin',
		password : 'hype41',
	});
	
	connection.query("use rendezview");
	
	connection.query("INSERT INTO users (userID, name, email, password, validated) VALUES (\'" + userid + "\', \'" + name + "\', \'" + email + "\', \'" + password + "\', 0);", function(err, response)
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
	
	mail.sendMail({
			from: "rendezview.server@gmail.com",
			to: email + "@my.bcit.ca",
			subject: "Welcome to RendezView",
			text: "Thank you for joining RendezView!\n\nYour registration is complete, you may now verify your account by clicking the following link:\n\n  162.156.5.173:84/" + name + "/validate?"
		}, function(error, response)
		{
			if(error)
				console.log("MAIL denied, STMP server error: " + error);

		});
}

io.sockets.on('connection', function(socket)
{
	var address = socket.handshake.address;
});

io.sockets.on('disconnect', function(socket)
{
	var address = socket.handshake.address;
});

function SQLError(err)
{
	if(err)
		console.log("SQL Error: " + err);
}