
	
var getUrlParameter = function getUrlParameter(sParam) {
	var sPageURL = decodeURIComponent(window.location.search.substring(1)),
		sURLVariables = sPageURL.split('&'),
		sParameterName,
		i;

	for (i = 0; i < sURLVariables.length; i++) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};  
		
		
function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }else{
		var expires = "";
	} 
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}

function storeHash(name) {
	var nowHash = $("#hash").val();
	eraseCookie('shutter_hash_cookie');
	createCookie('shutter_hash_cookie',nowHash,365);
}

	
	$(document).ready(function(){

		//Get room
		var room = getUrlParameter('room');
		
		//Handle hash from cookie
		var initHash = readCookie('shutter_hash_cookie');
		if (initHash) {
			$("#hash").val(initHash);
		}
		
		//Handle cookie hash
		var nowHash = $("#hash").val();

		//Get list of rooms	
		$.ajax({
				type: 'POST',
				url: 'http://10.84.82.239:50001/knx/', 
				dataType: "JSON",
				contentType: 'application/json',
				data: '{"hash":"'+nowHash+'"}',
				success: function(data){
					$.each(data, function(key, value) {
						$("#room_list").append('<li id="li_'+key+'"><a href="http://10.84.82.239?room='+key+'&debug=0/">'+key+'</a></li>');
						if(key.localeCompare(room) == 0){
							$("#li_"+key).addClass("active");
						}
					});
				},
				error: function(xhr, ajaxOptions, thrownError){
					//get the status code
					if (xhr.status == 401) {
						$("#error").removeClass("hidden");
					}
					if(xhr.status == 400 || xhr.status == 500) {
						$("#warning").removeClass("hidden");
					}
				}
			});
		

		//Load specified romm content
		if ('undefined' !== typeof room) {
			
			$("#page-header").text(room);
			
			//id of element
			var element_id = 0;
			
			//Handle cookie hash
			var nowHash = $("#hash").val();
			
			//Loop through all Shutters of the selected room
			var shutters = [];
			$.ajax({
				type: 'POST',
				url: 'http://10.84.82.239:50001/knx/'+room+'/', 
				dataType: "JSON",
				contentType: 'application/json',
				data: '{"hash":"'+nowHash+'"}',
				success: function(data){
				$.each(data, function(key, value) {
					//Write header
					$("#header_"+element_id).text(key);
					//$("#div_"+element_id).removeClass("hidden");
					shutters[element_id] = key;
					element_id += 1;
				});
				for (i = element_id; i < 5; i++) { 
					$("#div_"+i).addClass("hidden");
				}

			},
				error: function(xhr, ajaxOptions, thrownError){
					//get the status code
					if (xhr.status == 401) {
						$("#error").removeClass("hidden");
					}
					if(xhr.status == 400 || xhr.status == 500) {
						$("#warning").removeClass("hidden");
					}
				}
			});
		
		
		}else{
			//Load Overview Page
			$("#overview").addClass("active");
			$("#overview_body").removeClass("hidden");
			$("#page-header").text("Overview");
			for (i = 0; i < 5; i++) { 
					$("#div_"+i).addClass("hidden");
			}
		}
		
		//Trigger the call to the API
		$("button").click(function(){
			
			//Handle cookie hash
			var nowHash = $("#hash").val();

			if(nowHash.localeCompare(initHash) != 0) {
				eraseCookie('shutter_hash_cookie');
				createCookie('shutter_hash_cookie',nowHash,365);
			}
			
			$("#error").addClass("hidden");
			$("#error").addClass("hidden");
			
			var button_id = $(this).attr('id');
			var clicked = button_id.split("_");	
			var params="";
			if(clicked[1]=="angle"){params="?angle="+$("#"+button_id+"_in").val();}
			if($("#"+clicked[0]+"_slider").val() != 0 && (clicked[1].localeCompare('down') == 0 || clicked[1].localeCompare('up') == 0)){
				var duration = parseInt(0.75*parseInt($("#"+clicked[0]+"_slider").val()));
				params="?time="+duration;
			}
			var req = 'http://10.84.82.239:50001/knx/'+room+'/'+shutters[clicked[0]]+'/'+clicked[1]+params;
			$.ajax({
				type: 'POST',
				url: req, 
				dataType: "JSON",
				contentType: 'application/json',
				data: '{"hash":"'+nowHash+'"}',
				success: function(result){
					console.log("Request: "+req);
				},
				error: function(xhr, ajaxOptions, thrownError){
					//get the status code
					if (xhr.status == 401) {
						$("#error").removeClass("hidden");
					}
					if(xhr.status == 400 || xhr.status == 500) {
						$("#warning").removeClass("hidden");
					}
				}
			});
			
		});

		//Init sliders
		$(".sliders").slider({
			ticks: [0, 20,40,60,80,100],
			ticks_labels: ['open', '20%', '40%', '60%', '80%', 'closed'],
			step: 10,
			value: 0
		});


   
	});
