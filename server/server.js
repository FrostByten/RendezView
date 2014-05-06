//-----------------Includes----------------
var http = require('http'),
	url = require('url'),
	path = require('path'),
	qs = require('querystring'),
	fs = require('fs');
	
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
	console.log("\n\nVALIDATE request recieved\n");
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write("Email validated.\n You may now log on with your username.");
	response.end();
}
