var socket = io.connect('http://162.156.5.173:84');
var usersid = "";

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

function JSONTest()
{
	$.ajax(
	{
		url: '/',
		type: 'POST',
		contentType: 'application/json',
		data: 
		{ 
			json: JSON.stringify(
			{
			  "truth": false,
			  "meaningoflife": 42,
			  "name": "This is a test...!",
			  "brazil": [
				"hue",
				"ja",
				"es numero uno"
			  ]
			})
		},
		dataType: 'json'
	});
	
	window.location.replace("#regConfirmPage");
}

function noRegWindow()
{
	window.location.replace("#noReg");
}

function tryLogin()
{
	var user = document.getElementById("username").value,
		pass = document.getElementById("passwordlog").value,
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
		password = document.getElementById("password").value,
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
}

function correctLogin()
{
	document.getElementById("incorrecttext").style.display = 'none';
	usersid = document.getElementById("username").value;
	alert(usersid);
}
