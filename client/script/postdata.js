var socket = io.connect('http://162.156.5.173:84'),
	usersid = "",
	friendsettingsid = "",
	friendaddid = "",
	schedulesettingsid = "",
	friendlocation = "",
	selectedscheduleday = "",
	selectedscheduletime = "";

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

function showFriendLocation()
{
	document.getElementById("friendlocation").innerHTML = friendlocation;
	window.location.replace("../../../../../../../../index.html#friendLocationPage");
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
	var name = encodeURI(document.getElementById("name").value),
		sid = document.getElementById("sid").value,
		email = document.getElementById("email").value,
		password = md5("a91i" + document.getElementById("password").value),
		query = name + "/" + sid + "/" + email + "/" + password + "/register?";
		
	if(document.getElementById("password").value!=document.getElementById("passconf").value)
		window.location.replace("#noConfirm");
	if(name==""||sid==""||password==""||email=="")
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

function doFriendUpdate(JSONtext)
{
	var JSONfriends = JSON.parse(JSONtext),
		list = [];
	
	$(".friendslist").empty();
	
	for(var i=0;i<JSONfriends.length;i++)
	{
		var friend = JSONfriends[i];
		if(friend.status=="pendingb")
			list.push('<li><a href=\"javascript:addBack(\'' + friend.sid + '\');\" data-rel="dialog" data-transition="pop" data-theme="c">' + friend.name + '<span style=\"float:right;\">(Added You)</span></a><a href="javascript:friendSettingMenu(\'' + friend.sid + '\');" data-theme="a"></a></li>');
	}
	for(var i=0;i<JSONfriends.length;i++)
	{
		var friend = JSONfriends[i];
		if(friend.status=="pendinga")
			list.push('<li><a href=\"#waitConfirmPage\" data-rel="dialog" data-transition="pop">' + friend.name + '<span style=\"float:right;\">(Pending)</span></a><a href="javascript:friendSettingMenu(\'' + friend.sid + '\');"></a></li>');
	}
	for(var i=0;i<JSONfriends.length;i++)
	{
		var friend = JSONfriends[i];
		if(friend.status=="confirmed")
			list.push('<li><a href=\"javascript:locateFriend(\'' + friend.sid + '\');\">' + friend.name + '</a><a href="javascript:friendSettingMenu(\'' + friend.sid + '\');"></a></li>');
	}
	
	$(".friendslist").append(list.join(''));
	$(".friendslist").listview('refresh');
}

function updateFriendsList()
{
	window.location.replace(usersid + "/getfriends?");
}

function addBack(friendstring)
{
	friendaddid = friendstring;
	window.location.replace("#addBackPage");
}

function updateScheduleList(JSONtext)
{
	var JSONschedule = /*JSON.parse(JSONtext)*/[{"Day":"Wednesday","RoomID":"1850","BuildingID":"SW5","FromTime":"10:30 AM","ToTime":"1:30 PM"},{"Day":"Tuesday","RoomID":"1550","BuildingID":"NE1","FromTime":"8:00 AM","ToTime":"4:20 PM"},{"Day":"Saturday","RoomID":"Onnn","BuildingID":"Ononon","FromTime":"Break","ToTime":"Of Dawn"}],
		list = [];
	
	$(".schedulelist").empty();
	
	for(var i=0;i<JSONschedule.length;i++)
	{
		var schedule = JSONschedule[i];
		list.push('<li><a href=\"">' + schedule.Day + ' ' + schedule.FromTime + '-' + schedule.ToTime + '<br />' + schedule.BuildingID + ' ' + schedule.RoomID + '</a><a href="javascript:scheduleSettingsMenu(\'' + schedule.day + '\', \'' + schedule.FromTime + '\');"></a></li>');
	}
	
	$(".schedulelist").append(list.join(''));
	$(".schedulelist").listview('refresh');
}

function scheduleSettingsMenu(day, fromtime)
{
	selectedscheduleday = day;
	selectedscheduletime = fromtime;
	
	window.location.replace("#settingSchedulePage");
}

function deleteSchedule()
{

}

function logout()
{
	usersid = "";
	window.location.replace("#loginPage");
}

function deleteFriend()
{
	window.location.replace(usersid + "/" + friendsettingsid + "/deletefriend?");
	updateFriendsList();
}

function denyFriend()
{
	window.location.replace(usersid + "/" + friendaddid + "/deletefriend?");
	updateFriendList();
}

function addFriend()
{
	window.location.replace(usersid + "/" + document.getElementById("searchsid") + "/addfriend?");
	updateFriendsList();
}

function addFriendBack()
{
	window.location.replace(usersid + "/" + friendaddid + "/confirmfriend?");
	updateFriendsList();
}

function friendSettingMenu(userstring)
{
	friendsettingsid = userstring;
	window.location.replace("#settingFriendPage");
}

function denyFriend()
{
	window.location.replace(usersid + "/" + friendaddid + "/deletefriend?");
	updateFriendsList();
}

function locateFriend(friendid)
{
	window.location.replace(friendid + "/locatefriend?");
}
