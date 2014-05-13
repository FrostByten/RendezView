var socket = io.connect('http://162.156.5.173:84'),
	usersid = "",
	friendsettingsid = "",
	schedulesettingsid = "";

socket.on('noreg', function(data)
{
	noRegWindow();
});

socket.on('logincorrect', function(data)
{
	correctLogin();
});

socket.on('loginincorrect', function(data)
{
	incorrectLogin();
});

socket.on('loginnotverified', function(data)
{
	loginNotVerified();
});

function noRegWindow()
{
	window.location.replace("#noReg");
}

function tryLogin()
{
	var user = document.getElementById("username").value,
		pass = md5("a91i" + document.getElementById("passwordlog").value),
		query = user + "/" + pass + "/login?";
		
	if(user==""||pass=="")
	{
		window.location.replace("#loginIncorrect");
		return;
	}
	usersid = user;
	window.location.replace(query);
}

function sendReg()
{
	var name = document.getElementById("name").value,
		sid = document.getElementById("sid").value,
		email = document.getElementById("email").value,
		password = md5("a91i" + document.getElementById("password").value),
		firstname = name.split(" ")[0],
		lastname = name.split(" ")[1],
		query = firstname + "/" + lastname + "/" + sid + "/" + email + "/" + password + "/register?";
		
	if(document.getElementById("password").value!=document.getElementById("passconf").value)
		window.location.replace("#noConfirm");
	if(firstname==""||lastname==""||sid==""||password==""||email=="")
	{
		window.location.replace("#noReg");
		return;
	}
	else
	{
		window.location.replace(query);
		window.location.replace("#regConfirmPage");
	}
}

function resendEmail()
{
	window.location.replace(usersid + "/mail?");
	window.location.replace("#loginPage");
}

function loginNotVerified()
{
	window.location.replace("#loginNotVerified");
}

function incorrectLogin()
{
	document.getElementById("incorrecttext").style.display = 'block';
    alert("here");
}

function correctLogin()
{
	document.getElementById("incorrecttext").style.display = 'none';
	usersid = document.getElementById("username").value;
}

function updateFriendsList()
{
	var JSONfriends = [{"name":"Lewis Scott","sid":"A00855385","status":"confirmed"},{"name":"Jaja McHueington","sid":"A00112234","status":"pendinga"},{"name":"Ur Mum","sid":"A00696969","status":"pendingb"}]
	var list = [];
	
	$(".friendslist").empty();
	
	for(var i=0;i<JSONfriends.length;i++)
	{
		var friend = JSONfriends[i];
		if(friend.status=="confirmed")
			list.push('<li><a href=\"\">' + friend.name + '</a><a href="javascript:friendSettingMenu(\'' + friend.sid + '\');"></a></li>');
		else if(friend.status=="pending a")
			list.push();
		else if(friend.status=="pending b")
			list.push();
	}
	
	$(".friendslist").append(list.join(''));
	$(".friendslist").listview('refresh');
}

function updateScheduleList()
{
	var JSONschedule,
		list = [];
	
	$(".schedulelist").empty();
	
	for(var i=0;i<JSONschedule.length;i++)
	{
		var schedule = JSONschedule[i];
		//list.push();
	}
	
	$(".schedulelist").append(list.join(''));
	$(".schedulelist").listview('refresh');
}

function logout()
{
	usersid = "";
	window.location.replace("#loginPage");
}

function deleteFriend()
{
	window.location.replace(usersid + "/" + friendsettingsid + "/deletefriend?");
}

function addFriend()
{
	window.location.replace(usersid + "/" + document.getElementById("searchsid") + "/addfriend?");
}

function friendSettingMenu(userstring)
{
	friendsettingsid = userstring;
	window.location.replace("#settingFriendPage");
}
