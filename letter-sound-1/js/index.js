var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
		
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
		app.readConfig();
		
		/*var success = function(message) {
			alert(message);
		}

		var failure = function() {
			alert("Error calling Hello Plugin");
		}

		hello.greet("Bosta22", success, failure);*/
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
	/*
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
	*/
    },
	readConfig : function(){
		$.ajax({
		  dataType: "json",
		  url: 'config.json',
		  success: function(activitiesConfig){
			_.each(_.keys(activitiesConfig),function(activity){
				if((activitiesConfig[activity].dependencies == undefined) ||
					activitiesConfig[activity].length == 0){
						$("#"+activity).show();
				}else{
					var neededActivities = activitiesConfig[activity].dependencies;
					activities.getFinishedActivities(function(finishedActivites){
						if(neededActivities != undefined && _.difference(neededActivities,finishedActivites).length == 0){
							$("#"+activity).show();
						}
					});
					
					
				};
			});
		  }
		});
	}
};

app.initialize();