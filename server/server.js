//-----------------Includes----------------
var http = require('http'),
	url = require('url'),
	path = require('path'),
	qs = require('querystring'),
	fs = require('fs'),
	db = require('mysql'),
	socketio = require('socket.io'),
	nodemailer = require('nodemailer'),
	wait = require('wait.for');
	
//----------------Global Vars--------------
var httpport = 84,
	sqlport = 3306,
	externalip = "162.156.5.173",
	externalstring = externalip + ':' + httpport,
	dbip = "localhost",
	connection;

//-------------------Main------------------
console.log("Starting HTTP Server on port: " + httpport);
console.log("External connection address: http://" + externalstring + "/");
refreshDBConnection();
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
function refreshDBConnection()
{
	connection = db.createConnection({
		host : dbip,
		user : 'admin',
		password : 'hype41',
	});
	
	connection.connect(function(err)
	{
        if(err)
        {
            console.log(err);
            setTimeout(refreshDBConnection, 2000);
        }
	});
	
	connection.on('error', function(err)
	{
		console.log(err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST')
			refreshDBConnection();
		else
			console.log(err);
	});
}

function onRequest(request, response)
{
	if(request.method === "POST")
		wait.launchFiber(servePost, request, response);
	else //request method is GET or HEAD
		wait.launchFiber(serve, request, response);
}

function servePost(request, response)
{
	var path = url.parse(request.url).pathname;
	console.log("received post request: " + path);
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
		makeValid(list[2], response);
		return;
	}
	if(pathname.search("doreg?")!=-1)
	{
		queryRegister(list[3], list[2], list[4], list[5]);
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
    if(pathname.search("showschedule?")!=-1)
    {
        showSchedule(list[2], response);
        return;
    }
    if(pathname.search("addschedule?")!=-1)
    {
        console.log(pathname);
        addScheduleItem(list[1], response, list[2], list[3], list[4], list[5], list[6], list[7], list[8], list[9], list[10]);
        return;
    }
    if(pathname.search("setlocation?")!=-1)
    {
        console.log(pathname);
        setCurrentLocation(list[1], response, list[2], list[3], list[4], list[5], list[6]);
        return;
    }
    if(pathname.search("deleteschedule?")!=-1)
    {
        console.log(pathname);
        deleteScheduleItem(list[1], response, list[2], list[3]);
        return;
    }
	if(pathname.search("getfriends?")!=-1)
	{
        console.log("getting friendsenschlitzen");
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
		makefriends(list[2], list[3], response);
		return;
	}
	if(pathname.search("locatefriend?")!=-1)
	{
		locateFriend(list[2], response);
		return;
	}
	if(pathname.search("getajaxfriends?")!=-1)
	{
        console.log(pathname);
		getFriends(list[2], response);
		return;
	}
    if(pathname.search("showcurrentlocation?")!=-1)
	{
		getCurrentLocation(list[2], response);
		return;
	}
    if(pathname.search("ketchups?")!=-1)
    {
        console.log("No thank you.");
        //giveKetchups();
        return;
    }
	if(pathname.search("getajaxrooms?")!=-1)
	{
		getRooms(response);
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
	connection.query("INSERT INTO friends (userid_a, userid_b, confirmed) VALUES (\'" + current + "\', \'" + toadd + "\', 0);", function(err, rows, fields)
	{
		if(err)
			console.log(err);
	});
	
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("<script>window.location.replace(\"../../../../../index.html#friendMadePage\");</script>");
	response.end();
}

function locateFriend(friendid, response)//unfinished, locate via scheduling...........................................................................................................................................
{
	var location = "huehuehue";

	connection.query("use rendezview");
	//location logic here...
	
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("<script>friendlocation=\'" + location + "\'; showFriendLocation();</script>");
	response.end();
}

function confirmFriend(current, toadd, response)
{
	connection.query("use rendezview");
	connection.query("UPDATE friends SET confirmed=1 WHERE userid_a=\"" + toadd + "\" AND userid_b=\"" + current + "\";");
	
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("<script>window.location.replace(\"../../../../../../../../index.html#friendConfirmedPage\");</script>");
	response.end();
}

function deleteFriend(current, todelete, response)
{
	console.log("DELETE FRIEND request received");
	console.log(current + " wants to remove " + todelete + " as a friend");
	console.log("Deletion Approved...");
	
	connection.query("use rendezview");
	connection.query("DELETE FROM friends WHERE userid_a = \"" + current + "\" AND userid_b = \"" + todelete + "\";");
	connection.query("DELETE FROM friends WHERE userid_a = \"" + todelete + "\" AND userid_b = \"" + current + "\";");
	
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("<script>window.location.replace(\"../../../../../../../../../../../index.html#friendDeletedPage\");</script>");
	response.end();
}

function addFriend(current, toadd, response)
{
	console.log("ADD FRIEND request recieved");
	console.log(current + " wants to add " + toadd + " as a friend");
	
	if(current==toadd)
	{
		console.log("Add request denied: User cannot add self as friend...");
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<script>window.location.replace(\"../../../../../../../index.html#friendNotSelfPage\");</script>");
		response.end();
		return;
	}
	
	wait.forMethod(connection, 'query', "use rendezview");
	var rows = wait.forMethod(connection, 'query', "SELECT * FROM users WHERE userid = \"" + toadd + "\";");

	if(rows==null||rows==undefined)
	{
		console.log("Add denied: User " + toadd + " does not exist...");
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<script>window.location.replace(\"../../../../../../../index.html#friendNotExistPage\");</script>");
		response.end();
	}
	
	//check that we don't just have to confirm it
	var rows2 = wait.forMethod(connection, 'query', "SELECT * FROM friends WHERE userid_a=\"" + toadd + "\" AND userid_b=\"" + current + "\" AND confirmed=0");
	
	if(JSON.stringify(rows2)!="[]")
	{
		console.log("Add approved: Confirming friendship...");
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<script>window.location.replace(\"../../../../../../../" + externalstring + "/" + current + "/" + toadd + "/confirmfriend?\");</script>");
		response.end();
		return;
	}
	
	//check that they're not already friends
	var rows3 = wait.forMethod(connection, 'query', "SELECT * FROM friends WHERE userid_a=\"" + current + "\" AND userid_b=\"" + toadd + "\";");

	if(JSON.stringify(rows3)=="[]")
	{
		console.log("Add approved: Creating friendship...");
		
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<script>window.location.replace(\"../../../../../../../../" + externalstring + "/" + current + "/" + toadd + "/makefriends?\");</script>");
		response.end();
		return;
	}
	else
	{
		console.log("Add denied: Friendship already exists...");
		
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<script>window.location.replace(\'../../../../../../../index.html#alreadyFriendsPage\');</script>");
		response.end();
		return;
	}
}

function showSchedule(userid, response)
{
    console.log("Here 1");
    var JSONschedule = [];
    wait.forMethod(connection, 'query', "use rendezview");

    console.log("Getting shit for user " + userid);
	var rows = wait.forMethod(connection, 'query', "SELECT * FROM schedule WHERE userid=\"" + userid + "\"" + " \
    ORDER BY Case \
            When day Like 'monday' Then 1 \
            When day Like 'tuesday' Then 2 \
            When day Like 'wednesday' Then 3 \
            When day Like 'thursday' Then 4 \
            When day Like 'friday' Then 5 \
            When day Like 'saturday' Then 6 \
            When day Like 'sunday' Then 7 \
            Else 99 \
            End Asc \
    , day DESC, fromTime ASC");
    
    if(rows==null||rows==undefined||rows.length==0)
	{
		
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<script>window.location.replace(\"javascript:doScheduleUpdate(\'" + JSON.stringify(JSONschedule) + "\')\");</script>");
		response.end();
		
		return;
	}
    
    //[{"Day":"Wednesday","RoomID":"1850","BuildingID":"SW5","FromTime":"10:30 AM","ToTime":"1:30 PM"}]
    for(var i=0;i<rows.length;i++)
	{
        var row = rows[i];
        
		var day = row.day;
        var locationID = row.locationID;
        var room;
        var building;
        
        var rows2 = wait.forMethod(connection, 'query', "SELECT * FROM location WHERE locationID=\"" + locationID + "\"");
        room = rows2[0].roomID;
        building = rows2[0].areaID + rows2[0].buildingNum;
        
        var fromTime = row.fromTime;
        var toTime = row.toTime;
			
		JSONschedule.push({"Day":"\"" + day + "\"","RoomID":"\"" + room + "\"","BuildingID":"\"" + building + "\"","FromTime":"\"" + fromTime + "\"","ToTime":"\"" + toTime + "\""});
	}
    
    console.log("Displaying JSON data to return: " + JSON.stringify(JSONschedule));
	
	response.writeHead(200, {"Content-Type": "application/json"});
	response.end(JSON.stringify(JSONschedule));
    
}

function getCurrentLocation(userid, response)
{
    var JSONloc = {"BuildingID":"", "ToTime":""};
    wait.forMethod(connection, 'query', "use rendezview");

    console.log("Getting current loc for user " + userid);
	var rows = wait.forMethod(connection, 'query', "SELECT * FROM schedule WHERE userid=\"" + userid + "\"" + " AND day=\"" + getCurrentDay() +"\" AND NOW() BETWEEN fromTime AND toTime;");
    var currentRows = wait.forMethod(connection, 'query', "SELECT * FROM currentLocation WHERE userid='" + userid + "' AND date=CURDATE();");
    
    if(currentRows != null && currentRows != undefined && currentRows.length > 0)
    {
    
        var toTime = currentRows[0].currentToTime;
        var currentDate = new Date(); 
        var currentTime = currentDate.getHours() + ":" + currentDate.getMinutes() + ":00";
        if(compareTimes(toTime, currentTime) == 1)
        {
            var currentRows2 = wait.forMethod(connection, 'query', "SELECT * FROM location WHERE locationID=\"" + currentRows[0].locationID + "\"");
            JSONloc.BuildingID = currentRows2[0].areaID + currentRows2[0].buildingNum + " " + currentRows2[0].roomID;
            JSONloc.ToTime = convertTime(toTime);
        }
        else
        {
            var rows2 = wait.forMethod(connection, 'query', "SELECT * FROM location WHERE locationID=\"" + rows[0].locationID + "\"");
            JSONloc.BuildingID = rows2[0].areaID + rows2[0].buildingNum + " " + rows2[0].roomID;
            JSONloc.ToTime = convertTime(rows[0].toTime);
        }
    
    }
    else if(rows==null||rows==undefined||rows.length==0)
	{
		
		JSONloc.BuildingID = "Unknown";
        JSONloc.ToTime = "Unknown";
        
	}
    else
    {
        var rows2 = wait.forMethod(connection, 'query', "SELECT * FROM location WHERE locationID=\"" + rows[0].locationID + "\"");
        JSONloc.BuildingID = rows2[0].areaID + rows2[0].buildingNum + " " + rows2[0].roomID;
        JSONloc.ToTime = convertTime(rows[0].toTime);
    }
    console.log("Displaying JSON data to return: " + JSON.stringify(JSONloc));
	
	response.writeHead(200, {"Content-Type": "application/json"});
	response.end(JSON.stringify(JSONloc));
    //{"BuildingID":"","ToTime":""}

}

function getCurrentDay()
{
    var d = new Date();
    var n = d.getDay();
    if(n == 0)
    {
        return "sunday";
    }
    else if(n == 1)
    {
        return "monday";
    }
    else if(n == 2)
    {
        return "tuesday";
    }
    else if(n == 3)
    {
        return "wednesday";
    }
    else if(n == 4)
    {
        return "thursday";
    }
    else if(n == 5)
    {
        return "friday";
    }
    else if(n == 6)
    {
        return "saturday";
    }
    else
    {
        return "unknown day";
    }
}

function addScheduleItem(userid, response, dayOfWeek, fromHour, fromMinute, fromPM, toHour, toMinute, toPM, building, room)
{
    
	wait.forMethod(connection, 'query', "use rendezview");
    var fromTime;
    var toTime;
    
    if(fromPM == "pm")
    {
        fromTime = (+fromHour + 12) + ":" + fromMinute + ":00";
    }
    else
    {
        fromTime = fromHour + ":" + fromMinute + ":00";
    }
    
    if(toPM == "pm")
    {
        toTime = (+toHour + 12) + ":" + toMinute + ":00";
    }
    else
    {
        toTime = toHour + ":" + toMinute + ":00";
    }
    
    //Can't have a schedule item run into the next day
    if(compareTimes(fromTime, toTime) == 1)
    {
        response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<script>window.location.replace(\'../../../../../../../../../../../../../../../../../#scheduleTimeErrorPage\');</script>");
		response.end();
        return;
    }
    
	var rows = wait.forMethod(connection, 'query', "SELECT * FROM schedule WHERE userid=\"" + userid + "\"");
    if(rows != null && rows != undefined && rows.length > 0)
    {
    
        for(var i=0;i<rows.length;i++)
        {
            var conflict = compareSchedule(dayOfWeek, rows[i].day, fromTime, rows[i].fromTime, toTime, rows[i].toTime);
            if(conflict == 1)
            {
                console.log("No conflict");
            }
            else
            {
                console.log("Conflict");
                response.writeHead(200, {"Content-Type": "text/html"});
                response.write("<script>window.location.replace(\'../../../../../../../../../../../../../../../../../#scheduleConflictPage\');</script>");
                response.end();
                return;
            }
        }
        
        connection.query("INSERT INTO schedule (userid, locationID, day, fromTime, toTime) VALUES (\'" + userid + "\', \'" + room + "\', \'" + dayOfWeek + "\', \'" + fromTime + "\', \'" + toTime + "\');", function(err, rows, fields)
        {
            if(err)
                console.log(err);
        });
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("<script>window.location.replace(\'../../../../../../../../../../../../../../../../../#scheduleItemCreated\');</script>");
        response.end();
    
    }
    
}

function setCurrentLocation(userid, response, building, room, hour, minute, pm)
{
    
	wait.forMethod(connection, 'query', "use rendezview");
    var toTime;
    
    var currentDate = new Date(); 
    var currentTime = currentDate.getHours() + ":" + currentDate.getMinutes() + ":00";
    
    if(pm == "pm")
    {
        toTime = (+hour + 12) + ":" + minute + ":00";
    }
    else
    {
        toTime = hour + ":" + minute + ":00";
    }
    
    if(compareTimes(toTime, currentTime) == 2)
    {
        //Can't set a time that is earlier than now
        console.log("Set a time that is earlier than now.");
        response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<script>window.location.replace(\'../../../../../../../../../../../../../../../../../#locationTimeErrorPage\');</script>");
		response.end();
        return;
    }
    
    var buildingID = building.substring(2, building.length);
    var areaID = building.substring(0, 2);
    console.log("Selecting locationID of \"" + areaID + "\"  \"" + buildingID + "\"  " + room);
    var locationRows = wait.forMethod(connection, 'query', "SELECT * FROM location WHERE areaID=\"" + areaID + "\" AND buildingNum=\"" + buildingID + "\" AND roomID=\"" + room + "\";");

    //IF EXISTS (SELECT * FROM Table1 WHERE Column1='SomeValue')
   
    var exists = wait.forMethod(connection, 'query', "SELECT * FROM currentlocation WHERE userID=\"" + userid + "\"");
    
    if(exists == null || exists == undefined || exists.length == 0)
    {
        console.log("INSERT INTO currentlocation(userID,locationID,date,currentToTime) VALUES ('" + userid + "'," + locationRows[0].locationID + ",CURDATE()," + "'" + toTime + "')");
        wait.forMethod(connection, 'query', "INSERT INTO currentlocation(userID,locationID,date,currentToTime) VALUES ('" + userid + "'," + locationRows[0].locationID + ",CURDATE()," + "'" + toTime + "')");
    }
    else
    {
        console.log("UPDATE currentLocation SET locationID=\"" + locationRows[0].locationID + "\", date=CURDATE(), currentToTime=\"" + toTime + "\" WHERE userid='" + userid + "'");
        wait.forMethod(connection, 'query', "UPDATE currentLocation SET locationID=\"" + locationRows[0].locationID + "\", date=CURDATE(), currentToTime=\"" + toTime + "\" WHERE userid='" + userid + "'");
    }
    
	//var rows = wait.forMethod(connection, 'query', "UPDATE currentLocation SET locationID=\"" + locationRows[0].locationID + "\", date=CURDATE(), currentToTime=\"" + toTime + "\" WHERE userid=\"" + userid + "\"");
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("<script>window.location.replace(\'../../../../../../../../../../../../../../../../../#locationUpdated\');</script>");
    response.end();
    
}

//Return 1 if there is no conflict, 2 if there is
function compareSchedule(dayOne, dayTwo, fromTimeOne, fromTimeTwo, toTimeOne, toTimeTwo)
{
    console.log("Comparing " + fromTimeOne + "-" + toTimeOne + " with " + fromTimeTwo + "-" + toTimeTwo);
    
    if(dayOne.toLowerCase() != dayTwo.toLowerCase())
    {
        console.log("Different days.   " + dayOne + "    and     " + dayTwo);
        return 1;
    }
    //If fromTimeOne is earlier than toTimeTwo and later than fromTimeTwo
    if(compareTimes(fromTimeOne, toTimeTwo) == 2 && compareTimes(fromTimeOne, fromTimeTwo) == 1)
    {
        console.log("CONFLICT: Schedule item one begins during schedule item two");
        return 2;
    }
    //If toTimeOne is earlier than toTimeTwo and later than fromTimeTwo
    else if(compareTimes(toTimeOne, toTimeTwo) == 2 && compareTimes(toTimeOne, fromTimeTwo) == 1)
    {
        console.log("CONFLICT: Schedule item one begins before schedule item two is done");
        return 2;
    }
    
    return 1;
}

//Return 1 if timeOne is later, or 2 if timeTwo is later, or 3 if they are equal
function compareTimes(timeOne, timeTwo)
{
    var split = timeOne.split(":");
    var split2 = timeTwo.split(":");
    
    console.log("Comparing hours: " + +split[0] + " and " + +split2[0]);
    if(+split[0] > +split2[0])
    {
        console.log(timeOne + " is later than " + timeTwo + " by hours");
        return 1;
    }
    else if(+split[0] < +split2[0])
    {
        console.log(timeOne + " is earlier than " + timeTwo + " by hours");
        return 2;
    }
    else if(+split[1] > +split2[1])
    {
        return 1;
    }
    else if(+split[1] < +split2[1])
    {
        return 2;
    }
    else if(+split[3] > +split2[1])
    {
        return 1;
    }
    else if(+split[3] < +split2[1])
    {
        return 2;
    }
    
    return 3;
}

function deleteScheduleItem(userid, response, day, fromtime)
{
    
	wait.forMethod(connection, 'query', "use rendezview");
    console.log("fromtime: \"" + fromtime);
    var fromtime2 = reconvertTime(fromtime);
    var dayToUse = day.toLowerCase();
    
    console.log("DELETE FROM schedule WHERE userid=\'" + userid + "\' AND day=\'" + dayToUse + "\' AND fromTime=\'" + fromtime2 + "\';");
	wait.forMethod(connection, 'query', "DELETE FROM schedule WHERE userid=\'" + userid + "\' AND day=\'" + dayToUse + "\' AND fromTime=\'" + fromtime2 + "\';");
    
    console.log("here 2");
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("<script>window.location.replace(\'../../../../../../../../../../../../../../../../../#scheduleItemDeleted\');</script>");
    response.end();
    
}

function reconvertTime(time)
{
    
    console.log("Reconverting \"" + time + "\"");
    var timeSplit = time.split(":");
    if(time.indexOf("PM") > -1)
    {
        if(timeSplit[0] != "12")
        {
            timeSplit[0] = +timeSplit[0] + 12;
        }
    }
    
    console.log("timesplit 1: \"" + timeSplit[1] + "\"");
    var newTime = timeSplit[0] + ":" + timeSplit[1] + ":00";
    console.log("Converted: \"" + newTime + "\"");
    return newTime;
}

function convertTime(time)
{

    var arr = time.split(":");
    var toReturn = "";
    if(arr[0] >= 12)
    {
        if(arr[0] == 12)
        {
            toReturn = 12 + ":" + arr[1] + " PM";
        }
        else
        {
            toReturn = (+arr[0] - 12) + ":" + arr[1] + " PM";
        }
    }
    else
    {
        toReturn = arr[0] + ":" + arr[1] + " AM";
    }
    
    return toReturn;

}

function getFriends(userid, response)
{
	var JSONfriends = [];
    
	wait.forMethod(connection, 'query', "use rendezview");

	var rows = wait.forMethod(connection, 'query', "SELECT * FROM friends WHERE userid_a=\"" + userid + "\" OR userid_b=\"" + userid + "\";");

	if(rows==null||rows==undefined||rows.length==0)
	{
		//this guy's a loser...
		console.log("User: " + userid + " has no friends!!! What a scrub!");
		
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<script>window.location.replace(\"javascript:doFriendUpdate(\'" + JSON.stringify(JSONfriends) + "\')\");</script>");
		response.end();
		
		return;
	}
	for(var i=0;i<rows.length;i++)
	{
		var sid = "";
		sid = rows[i].userID_A;
			
		if(sid==userid)
			sid = rows[i].userID_B;
			
		JSONfriends.push({"name":"","sid":sid,"status":"confirmed"});
        if(rows[i].confirmed==0)
        {
            var rows2 = wait.forMethod(connection, 'query', "SELECT * FROM friends WHERE userid_a = \"" + userid + "\" AND userid_b = \"" + JSONfriends[i].sid + "\";");
            if(rows2==null||rows2==undefined||rows2.length==0)
                JSONfriends[i].status = "pendingb";
            else
                JSONfriends[i].status = "pendinga";
        }
	}
	for(var i=0;i<JSONfriends.length;i++)
	{
        console.log("Getting name of " + JSONfriends[i].sid);
		var rows = wait.forMethod(connection, 'query', "SELECT * FROM users WHERE userid=\"" + JSONfriends[i].sid + "\";");
		
		if(JSON.stringify(rows[0])=="[]"||rows==undefined||rows[0]==undefined)
			JSONfriends[i].name = "Unnamed...";
		else
            JSONfriends[i].name = unescape(rows[0].name);
	}
    console.log("Displaying JSON data to return: " + JSON.stringify(JSONfriends));
	
	response.writeHead(200, {"Content-Type": "application/json"});
	response.end(JSON.stringify(JSONfriends));
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
				response.write("<script>window.location.replace(\'../../../../../../../" + externalstring + "/" + name + "/makevalid?\');</script>");
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
        console.log("Login successful: " + list[1]);
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<script>window.location.replace(\"../../../../index.html#mainPage\");</script>");
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
			response.write("<script>window.location.replace(\'../../../../../../../../../" + externalstring + "/" + sid + "/" + name + "/" + email + "/" + password + "/doreg?\');</script>");
			response.end();
		}
	});
}

function queryRegister(name, userid, email, password)
{
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
			text: "Thank you for joining RendezView!\n\nYour registration is complete, you may now verify your account by clicking the following link:\n\n  " + externalstring + "/" + name + "/validate?"
		}, function(error, response)
		{
			if(error)
				console.log("MAIL denied, STMP server error: " + error);
		});
}

function getRooms(response)
{
	var JSONrooms = [];
    
	wait.forMethod(connection, 'query', "use rendezview");

	var rows = wait.forMethod(connection, 'query', "SELECT DISTINCT areaID,buildingNum FROM location ORDER BY areaID ASC, buildingNum ASC;");

	for(var i=0;i<rows.length;i++)
	{
		var building = {"name":rows[i].areaID + rows[i].buildingNum,"rooms":[]},
			rows2 = wait.forMethod(connection, 'query', "SELECT * FROM location WHERE areaID=\'" + rows[i].areaID + "\' AND buildingNum=\'" + rows[i].buildingNum + "\';");
		
		for(var j=0;j<rows2.length;j++)
		{
			building.rooms.push({"roomID":rows2[j].roomID,"locationID":rows2[j].locationID});
		}
		
		JSONrooms.push(building);
	}
	
	//console.log("JSON Object for Rooms: " + JSON.stringify(JSONrooms));
	response.writeHead(200, {"Content-Type": "application/json"});
	response.end(JSON.stringify(JSONrooms));
}

function SQLError(err)
{
	if(err)
		console.log("SQL Error: " + err);
}