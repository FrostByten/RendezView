function sendReg()
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

function resend()
{
	
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
