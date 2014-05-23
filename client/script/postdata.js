var usersid = "",
	friendsettingsid = "",
	friendaddid = "",
	schedulesettingsid = "",
	friendlocation = "",
	selectedscheduleday = "",
	selectedscheduletime = "",
	ipstring = "162.156.5.173:84",
	locations = [];
    
$(document).ready(onReady());

function updateRooms(value)
{
	var list = [],
        name = "";
	
	$(".room").empty();
	
	for(var i=0;i<locations.length;i++)
	{
		if(locations[i].name==value)
		{
			for(var j=0;j<locations[i].rooms.length;j++)
			{
				list.push('<option value=\"' + locations[i].rooms[j].locationID + '\" id=\"' + locations[i].rooms[j].locationID + '\">' + locations[i].rooms[j].roomID + '</option>');
			}
            name = locations[i].rooms[0].locationID;
		}
	}
	
	$(".room").append(list.join(''));
	$(".room").val(name).change();
}

function updateLists()
{
	$.getJSON("/" + ipstring + "/getajaxrooms?", function(data)
    {
        updateLocationLists(JSON.stringify(data));
    });
}

function updateScheduleList()
{
    console.log("Updating schedule list...");
	$.getJSON("/" + ipstring + "/" + window.name + "/showschedule?", function(data)
    {
        console.log("Retrieved JSON Data");
        console.log(JSON.stringify(data));
        gotoSchedule(JSON.stringify(data));
    });
}

function updateLocationLists(data)
{
	var list = [];
	
	locations = JSON.parse(data);
	
	$(".building").empty();
	$(".room").empty();
	
	for(var i=0;i<locations.length;i++)
	{
		list.push('<option value=\"' + locations[i].name + '\" id=\"' + locations[i].name + '\">' + locations[i].name + '</option>');
	}
	
	$(".building").append(list.join(''));
	$(".building").trigger("chosen:updated");
	$(".building").val($(".building option:first").val());
    $(".building").val(locations[0].name).change();
    updateRooms(locations[0].name);
}

function onReady()
{
	updateLists();
}

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
	window.name = user;
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
	{
		window.location.replace("#noConfirm");
		return;
	}
	
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
	window.location.replace(window.name + "/mail?");
	window.location.replace("#loginPage");
}

function loginNotVerified()
{
	window.location.replace("#loginNotVerified");
}

function incorrectLogin()
{
	document.getElementById("incorrecttext").style.display = 'block';
    //alert("here");
}

function correctLogin()
{
	document.getElementById("incorrecttext").style.display = 'none';
	window.name = document.getElementById("username").value;
	updateLocationLists();
	updateFriendsList();
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
	$.getJSON("/" + ipstring + "/" + window.name + "/getajaxfriends?", function(data)
    {
        doFriendUpdate(JSON.stringify(data));
    });
}

function addBack(friendstring)
{
	friendaddid = friendstring;
	window.location.replace("#addBackPage");
}

function backToFriends()
{
    updateFriendsList();
	window.location.replace("../../../../../index.html#friendsPage");
}

function updateScheduleItems(JSONtext)
{
    console.log("aaaaaaasfafs");
    console.log(JSONtext);
	var JSONschedule = JSON.parse(JSONtext);
	var list = [];
	
	$("#scheduleList").empty();
	
	for(var i=0;i<JSONschedule.length;i++)
	{
		var schedule = JSONschedule[i];
        
        var newFromTime = schedule.FromTime;
        newFromTime = newFromTime.substring(1, newFromTime.length - 4);
        var useFromTime = newFromTime + ":00";
        newFromTime = convertTime(newFromTime);
        
        console.log("From time: " + useFromTime);
        
        var newToTime = schedule.ToTime;
        newToTime = newToTime.substring(1, newToTime.length - 4);
        newToTime = convertTime(newToTime);
        
        var newDay = schedule.Day;
        newDay = newDay.substring(1, newDay.length - 1);
        newDay = newDay.charAt(0).toUpperCase() + newDay.slice(1);
        
        var newBuildingID = schedule.BuildingID;
        newBuildingID = newBuildingID.substring(1, newBuildingID.length - 1);
        
        var newRoomID = schedule.RoomID;
        newRoomID = newRoomID.substring(1, newRoomID.length - 1);
        
		list.push('<li><a href=\"">' + newDay + ' ' + newFromTime + ' - ' + newToTime + '<br />' + newBuildingID + '&nbsp;&nbsp;&nbsp;' + newRoomID + '</a><a href="javascript:scheduleSettingsMenu(\'' + newDay + '\', \'' + useFromTime + '\');"></a></li>');
	}
	
	$("#scheduleList").append(list.join(''));
	$("#scheduleList").listview('refresh');
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

function scheduleSettingsMenu(day, fromtime)
{
	selectedscheduleday = day;
	selectedscheduletime = fromtime;
	
	window.location.replace("#settingSchedulePage");
}

function deleteSchedule()
{
    window.location.replace("../../../../../../" + window.name + "/" + selectedscheduleday + "/" + selectedscheduletime + "/deleteschedule?");
}

function addScheduleItem()
{
	window.location.replace("../../../../../../" + window.name + "/" + document.getElementById("every").value + "/" + document.getElementById("fromhour").value + "/" + document.getElementById("fromminute").value + "/" + document.getElementById("frompm").value + "/" + document.getElementById("tohour").value + "/" + document.getElementById("tominute").value + "/" + document.getElementById("topm").value + "/" + document.getElementById("building").value + "/" + document.getElementById("roomsch").value +  "/addschedule?");
}

function gotoFriends()
{
    updateFriendsList();
    window.location.replace("#friendsPage");
}

function gotoSchedule(JSONtext)
{
    console.log("aaa");
    window.location.replace("#schedulePage");
    updateScheduleItems(JSONtext);
    
}

function login(dervar)
{
    window.name=dervar;
    window.location.replace("../../../index.html#mainPage");
}

function logout()
{
	window.name = "";
	window.location.replace("#loginPage");
}

function deleteFriend()
{
	window.location.replace(window.name + "/" + friendsettingsid + "/deletefriend?");
}

function denyFriend()
{
	window.location.replace(window.name + "/" + friendaddid + "/deletefriend?");
}

function addFriend()
{
	window.location.replace("../../../../../../" + window.name + "/" + document.getElementById("searchsid").value + "/addfriend?");
}

function addFriendBack()
{
	window.location.replace(window.name + "/" + friendaddid + "/confirmfriend?");
}

function friendSettingMenu(userstring)
{
	friendsettingsid = userstring;
	window.location.replace("#settingFriendPage");
}

function denyFriend()
{
	window.location.replace(window.name + "/" + friendaddid + "/deletefriend?");
}

function locateFriend(friendid)
{
	window.location.replace(friendid + "/locatefriend?");
}
