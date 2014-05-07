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

function tryLogin()
{
	var user = document.getElementById("username").value,
		pass = document.getElementById("passwordlog").value,
		query = user + "/" + pass + "/login?";
		
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
		
	if(password!=document.getElementById("passconf").value)
		window.location.replace("#noConfirm");
	else
	{
		window.location.replace(query);
		window.location.replace("#regConfirmPage");
	}
}

function resendEmail()
{
	//tell server to resend email
	window.location.replace("#loginPage");
}

function incorrectLogin()
{
	document.getElementById("incorrecttext").style.display = 'block';
}

function correctLogin()
{
	document.getElementById("incorrecttext").style.display = 'none';
}
