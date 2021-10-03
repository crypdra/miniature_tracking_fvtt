let wsInterval;
let wsOpen = false;

async function analyzeWSmessage(msg,passthrough = false){

    let data = JSON.parse(msg.data);
    console.log(data)
    if(data.moveTo) {
        console.log(data)
        let xMovement = data.moveTo.x * canvas.grid.size;
        let yMovement = data.moveTo.y * canvas.grid.size;
        let viewPosition = canvas.scene._viewPosition;

        var moveFromX = (viewPosition.x-(window.innerWidth)/viewPosition.scale/2)+data.moveFrom.x * canvas.grid.size;
        var moveFromY = (viewPosition.y-(window.innerHeight)/viewPosition.scale/2)+data.moveFrom.y * canvas.grid.size;
        var moveToX = (viewPosition.x-(window.innerWidth)/viewPosition.scale/2)+xMovement;
        var moveToY = (viewPosition.y-(window.innerHeight)/viewPosition.scale/2)+yMovement;
        for(var i=0; i<canvas.tokens.children[0].children.length; i++) {
            var dx = canvas.tokens.children[0].children[i].transform.position.x - moveFromX;
            var dy = canvas.tokens.children[0].children[i].transform.position.y - moveFromY;
            var distance = Math.sqrt(dx*dx + dy*dy)
            if(distance<30) {
                let viewPosition = canvas.scene._viewPosition;
                canvas.tokens.children[0].children[i].document.update({x: moveToX});
                canvas.tokens.children[0].children[i].document.update({y: moveToY});
            }
            console.log(distance);
        }

    }
    // Set X: canvas.tokens.children[0].children[0].document.update({x:(viewPosition.x-(window.innerWidth)/viewPosition.scale/2)});
    // Set Y: canvas.tokens.children[0].children[0].document.update({y:(viewPosition.y-(window.innerHeight)/viewPosition.scale/2)});
}

function resetWS(){

    if (wsOpen) {
        wsOpen = false;
        ui.notifications.warn("Miniature tracking: Connection closed!");
        startWebsocket();
    }
    else if (ws.readyState == 3){
        ui.notifications.warn("Miniature tracking: Connection failed!");
        startWebsocket();
    }

}

function startWebsocket() {
    console.log("starting WS")
    ws = new WebSocket('ws://127.0.0.1:8765');
    clearInterval(wsInterval);

    ws.onmessage = function(msg){
        analyzeWSmessage(msg)
        clearInterval(wsInterval);
        wsInterval = setInterval(resetWS, 5000);
    }

    ws.onopen = function() {
        wsOpen = true;
        clearInterval(wsInterval);
        wsInterval = setInterval(resetWS, 5000);
    }
  
    clearInterval(wsInterval);
    wsInterval = setInterval(resetWS, 1000);
}

Hooks.on("ready", function() {
    if(!game.user.isGM) {
        startWebsocket();
    }
});


