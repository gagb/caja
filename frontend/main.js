var GAME_STATE = {
	"mode": 0,
	"gameid": null,
	"hitid": null,
	"h1fail": null,
	"assignmentid": null,
	"workerid": null,
	"time": null,
	"round": -1,
	"features": null,
	"h": -1,
	"h1": -1,
	"action": -1,
	"score": 0,
	"code": null,
};

var CONFIG = null;
var SAMPLES = {"base": [], "updated": []};
var CODE = null;
var INTERACTION_LOG = [];
var DOLLAR_SIGN = "<span>&#36</span>";
var UPDATE = false;

window.onerror = function myErrorHandler(errorMsg, url, lineNumber, colNumber, error) {
	$("#game-area").hide();
	$("#game-loading").show();
	$("#game-loading").html("ARE YOU TRYING TO PLAY THE GAME FOR THE SECOND TIME? If you are please return the HIT. If not, something went terribly wrong...</br> Please send us a screenshot of this page</br></br></br>" + error.stack);
    return false;
}

function updateInstruction(text, success){
	document.getElementById("game-instruction").innerHTML = text;
	if (success == 1){
		document.getElementById("game-instruction").className = "game-instruction-correct";
	}
	else if (success == 0){
		document.getElementById("game-instruction").className = "game-instruction-mistake";
	}
	else{
		document.getElementById("game-instruction").className = "game-instruction-neutral";
	}

	return;
}


var graphicWindow, camera, scene, renderer, textures, texturePromises;

function updateGraphics(){
	var features = GAME_STATE["sample"]["features"];
	updateFeatureTable(features);
	threejs_render(features);
}

function updateFeatureTable(features){
	var tableHTML = "<caption>Features in the object:</caption><thead><tr><th>Feature</th><th>Value</th></tr></thead>";
	tableHTML += "<tbody>";
	for (var key in features){
		var val = features[key];
		tableHTML += "<tr><td>" + key + "</td><td>" + val + "</td></tr>";
	}
	tableHTML += "</tbody>";
	$("#game-graphics-table").html(tableHTML);
}

function clearGraphics(){
	while(scene.children.length > 0){
		scene.remove(scene.children[0]);
	}
	renderer.setClearColor("#ffffff", 0 );

	renderer.render(scene, camera);
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function graphicFeedback(reward){
	if (reward < 0){
		renderer.setClearColor("#ffb1a0");
	}
	else{
		renderer.setClearColor("#cfffbf");
	}
	renderer.render(scene, camera);
}


function initGraphics(){
	graphicWindow = document.getElementById("game-graphics");
	var height = graphicWindow.offsetHeight;
	var width = graphicWindow.offsetWidth;
	camera = new THREE.PerspectiveCamera(70, width/height, 1, 1000);
	camera.position.set(0, 0, 300);
	var light = new THREE.PointLight( 0xffffff, 0.8 );
	camera.add( light );
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({alpha: true});
	renderer.setSize(width, height);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor("#ffffff", 0);

	var loader = new THREE.TextureLoader();
	textures = {
		"fur": {
			url: "./fur.jpg",
			val: undefined,
		},
		"checkered": {
			url: "./checkered.png",
			val: undefined 
		}
	};
	texturePromises = [];
	for (var key in textures){
		texturePromises.push(new Promise((resolve, reject) => {
			var entry = textures[key];
			var url = entry.url;
			loader.load(
				url,
				texture => {
					console.log("loaded " + url);
					entry.val = texture;
					console.log(entry);
					resolve(entry);
				},
				xhr => {
					console.log(url + ' ' + (xhr.loaded / xhr.total * 100) + '% loaded');
				},
				xhr => {
					reject(new Error(xhr +
					'An error occurred loading while loading: ' +
					url));
				}
			);
		}));
	}
}

function threejs_render(features){
	clearGraphics();
	var shape = null;
	var size = 1;
	if(features["size"] == "large"){
		size = 2;
	}
	if (features["shape"] == "square"){
		var sqLength = size * 100;
		var squareShape = new THREE.Shape();
		squareShape.moveTo(-sqLength/2, -sqLength/2);
		squareShape.lineTo(0-sqLength/2, sqLength-sqLength/2);
		squareShape.lineTo(sqLength-sqLength/2, sqLength-sqLength/2);
		squareShape.lineTo( sqLength-sqLength/2, 0-sqLength/2);
		squareShape.lineTo( 0-sqLength/2, 0 -sqLength/2);
		shape = squareShape;
	}
	else if (features["shape"] == "rectangle"){
		var rectLength = 120 * size; 
		var rectWidth = rectLength / 3;
		var rectShape = new THREE.Shape();
		rectShape.moveTo( 0-rectLength/2, 0-rectWidth/2 );
		rectShape.lineTo( 0-rectLength/2, rectWidth-rectWidth/2 );
		rectShape.lineTo( rectLength-rectLength/2, rectWidth-rectWidth/2 );
		rectShape.lineTo( rectLength-rectLength/2, 0 -rectWidth/2);
		rectShape.lineTo( 0-rectLength/2, 0 -rectWidth/2);
		shape = rectShape;
	}
	else if (features["shape"] == "circle"){
		var circleRadius = 60 * size;
		var circleShape = new THREE.Shape();
		circleShape.moveTo( 0, circleRadius );
		circleShape.quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 );
		circleShape.quadraticCurveTo( circleRadius, - circleRadius, 0, - circleRadius );
		circleShape.quadraticCurveTo( - circleRadius, - circleRadius, - circleRadius, 0 );
		circleShape.quadraticCurveTo( - circleRadius, circleRadius, 0, circleRadius );
		shape = circleShape;
	}
	var geometry = new THREE.ShapeBufferGeometry(shape);

	if (features["fur"] == "present"){
		var texture = textures["fur"].val;
		console.log(texture);
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(0.008, 0.008)
		var material = new THREE.MeshBasicMaterial({
			map: texture
		});
		var furGeometry = new THREE.ShapeBufferGeometry(shape);
		var mesh = new THREE.Mesh(furGeometry, material);
		mesh.scale.set(1.2, 1.2, 1);
		scene.add(mesh);
		graphicWindow.appendChild(renderer.domElement);
		renderer.render(scene, camera);
	}

	if (features["horizontalPole"] == "present"){
		var rectLength = 2 * 120 * size; 
		var rectWidth = rectLength / 10;
		var shape = new THREE.Shape();
		shape.moveTo( 0-rectLength/2, 0-rectWidth/2 );
		shape.lineTo( 0-rectLength/2, rectWidth-rectWidth/2 );
		shape.lineTo( rectLength-rectLength/2, rectWidth-rectWidth/2 );
		shape.lineTo( rectLength-rectLength/2, 0 -rectWidth/2);
		shape.lineTo( 0-rectLength/2, 0 -rectWidth/2);
		var horizontalPole = new THREE.ShapeBufferGeometry(shape);
		var material = new THREE.MeshBasicMaterial({
			color: "#bcc0c6"
		});
		renderObject(horizontalPole, material);
	}


	if (features["texture"] == "checkered"){
		var texture = textures["checkered"].val;
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(0.008, 0.008)
		var material = new THREE.MeshBasicMaterial({
			color: features["color"],
			map: texture
		});
		renderObject(geometry, material);
	}
	else{
		var material = new THREE.MeshBasicMaterial({
			color: features["color"]
		});
		renderObject(geometry, material);
	}
}


function renderObject(geometry, material){
	mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);
	graphicWindow.appendChild(renderer.domElement);
	renderer.render(scene, camera);
}

function updateHeading(){
	var gameHeading = document.getElementById("game-heading");
	var heading = "";
	switch (GAME_STATE["mode"]){
		case 1:
			var gameScore = document.getElementById("game-score");
			gameScore.innerHTML = GAME_STATE["score"].toFixed(2);
			break;
		case 2:
			heading = "Game Over";
			gameHeading.innerHTML = heading;
			break;
	}
}

//function updateTime(time){
	//document.getElementById("game-clock").innerHTML = time;
	//return;
//}

function writeToVar(){
	var interaction = JSON.parse(JSON.stringify(GAME_STATE));
	console.log(interaction);
	INTERACTION_LOG.push(interaction);
	writeToDatabase(interaction);
}

function writeToDatabase(interaction){
	console.log(interaction)
	$.ajax({
		type: "POST",
		url: "/log",
		data: JSON.stringify(interaction),
		contentType: 'application/json',
		dataType: "json",
		success: function(response){
			console.log("successfully wrote to db " + interaction);	
			console.log(response);	
		},
		error : function(xhr, textStatus, errorThrown ) {
			console.log("error writing to db " + interaction);
		},
	});
}

function getCurrentTime(){
	return new Date().getTime()
}

async function initGame(){
	$("#game-quit-btn").click(
			function(){
				endGame();		
			}
	);
	var radioBtns = document.getElementsByName("action");
	for (radio in radioBtns){
		var btn = radioBtns[radio];
		btn.onclick = 
		async function (){
			GAME_STATE["time"] = getCurrentTime();
			disableElement("game-controls");
			GAME_STATE["action"] = this.value;
			giveFeedback();
			writeToVar();
			await sleep(CONFIG["delay"]);
			clearFeedback();
			nextRound();
		};
	}
	//initGraphics();
	document.getElementById("game-state").style.visibility = "visible";
	document.getElementById("game-controls").style.visibility = "visible";
	console.log("Initializing graphics...");
	initGraphics();
	Promise.all(texturePromises).then(function(loadedTextures){
		updateGameState();
		nextRound();
	});
}

//function updateControls(){
	//var buttons = document.getElementsByClassName("game-controls-btn-accept");
	//for (var i=0; i< buttons.length; i++){
		//var btn = buttons[i];
		//var container = btn.parentElement
		//var head = container.getElementsByClassName("game-controls-robot")[0];
		//if (btn.value != GAME_STATE["h1"]){
			//head.style.visibility = "hidden";
			//btn.disabled = true;
		//}
		//else{
			//head.style.visibility = "visible";
			//btn.disabled = false;
		//}
	//}
//}

function updateGameState(){
	updateHeading();
	document.getElementById("game-round").innerHTML = (GAME_STATE["round"] + 1)+ "/" + CONFIG["numrounds"];
	//updateControls();
}

//function startTimer(){
	//var timer = setInterval(
			//function(){
				//GAME_STATE["time"] -= 1;
				//updateTime(GAME_STATE["time"]);

				//if (GAME_STATE["time"] == 0){
					//clearInterval(timer);
					//endGame();
				//}
			//}, 1000);
//}

function endGame(){
	GAME_STATE["mode"] = 2;
	$("#game-state").hide();
	$("#game-controls").hide();
	$("#game-graphics-table").hide();
	//disableElement("game-controls");
	disableElement("game-graphics");
	clearGraphics();
    updateHeading();
	updateInstruction("You earned a bonus of " + DOLLAR_SIGN + GAME_STATE["score"].toFixed(2) + " in this step<br> Completion code: " + CODE);
}

function disableElement(id){
	// This will disable all the children of the div
	 var nodes = document.getElementById(id).getElementsByTagName('*');
	 for(var i = 0; i < nodes.length; i++){
		  nodes[i].disabled = true;
	  }
}

function enableElement(id){
	// This will disable all the children of the div
	 var nodes = document.getElementById(id).getElementsByTagName('*');
	 for(var i = 0; i < nodes.length; i++){
		  nodes[i].disabled = false;
	  }
}

function randInt(range){
	return Math.floor(Math.random() * range);
}

function fetchSample(roundNum){
	var key = "base";
	if (UPDATE && roundNum >= CONFIG["numrounds"]/2){
		key = "updated"
		roundNum = roundNum - CONFIG["numrounds"]/2;
	}
	console.log(UPDATE);
	console.log(roundNum);
	var sample = SAMPLES[key][roundNum]; 
	return sample;
}

function getReward(syspred, target, action){
	var reward = CONFIG["payoff"][(syspred == target) ?0: 1][(action==2) ? 1: 0];
	return reward;
}

function showFeedback(reward, syspred, target, action){
	var text, success;
	if (reward >= 0){
		text = "+" + DOLLAR_SIGN + reward.toFixed(2);
	}
	else{
		text = "Ouch! -" + DOLLAR_SIGN + (-1 * reward.toFixed(2));
	}

	action = parseInt(action);
	var robotText, feedbackClass;
	if (syspred == target && action != 2){
		robotText = "Thank you for trusting me";
		feedbackClass = "game-robot-feedback-happy";
		success = 1;
	}
	else if (syspred == target && action == 2){
		robotText = "We could have earned " + DOLLAR_SIGN + getReward(syspred, target, syspred).toFixed(2) + " if you had trusted me";
		feedbackClass = "game-robot-feedback-sad";
		success = 0;
	}
	else if (syspred != target && action != 2){
		robotText = "Sorry! I made a mistake";
		feedbackClass = "game-robot-feedback-sad";
		success = 0;
	}
	else{
		//console.log(syspred, target, action);
		robotText = "I would have gotten it wrong! You saved us!";
		feedbackClass = "game-robot-feedback-happy";
		success = 1;
	}
	updateInstruction(text, success);
	updateRobotFeedback(robotText, feedbackClass, true);
}

function clearFeedback(){
	updateRobotFeedback("", "", false);
}

function updateRobotFeedback(text, className, visibility){
	var robotFeedbackNode = document.getElementById("game-robot-feedback-text");
	robotFeedbackNode.innerHTML = text;
	robotFeedbackNode.className = className;
	if (visibility == false){
		robotFeedbackNode.parentElement.style.visibility = "hidden";
	}
	else{
		robotFeedbackNode.parentElement.style.visibility = "visible";
	}

}

function giveFeedback(){
	var prevSample = GAME_STATE["sample"];
	var pred = GAME_STATE["action"] == 2 ? GAME_STATE["h"]: GAME_STATE["h1"]; 
	var reward = getReward(GAME_STATE["h1"], GAME_STATE["h"], GAME_STATE["action"]);
	GAME_STATE["score"] += reward;
	GAME_STATE["score"] = +GAME_STATE["score"].toFixed(2);
	GAME_STATE["score"] = Math.max(0, GAME_STATE["score"]);
	showFeedback(reward, GAME_STATE["h1"], GAME_STATE["h"], GAME_STATE["action"]);
}

function displayUpdateMessage(){
	var accuracy = parseInt(CONFIG["updated"]["accuracy"] * 100);
	alert('Marvin has been updated! He is now ' + accuracy + '% reliable!\nClick "OK" to continue playing.');
}

function nextRound(){
	console.log(GAME_STATE["round"]);
	console.log(CONFIG["numrounds"]);
	if (GAME_STATE["round"] >= CONFIG["numrounds"] - 1){
		console.log("Ending game");
		endGame();
		return
	}
	updateInstruction("Is this object defective?");
	enableElement("game-controls");
	GAME_STATE["round"] += 1;
	if (UPDATE & (GAME_STATE["round"] == CONFIG["numrounds"]/2) & (CONFIG["notifystyle"] == "notify")){
		displayUpdateMessage();	
	}
	var sample = fetchSample(GAME_STATE["round"]);
	GAME_STATE["sample"] = sample;
	GAME_STATE["features"] = sample["features"];
	GAME_STATE["h1"] = sample["h1"];
	GAME_STATE["h"] = sample["h"];
	GAME_STATE["h1fail"] = sample["h1fail"];
	console.log("Updating graphics...");
	updateGraphics();
	updateGameState();
}

function checkitem()                        // check function
{
	var $this = $('#game-instructions-carousel');
	if($('.carousel-inner .item:first').hasClass('active')) {
		$this.children('#game-instructions-back').hide();
		$this.children('#game-instructions-next').show();
		$this.children('#begin-btn').hide();
	} else if($('.carousel-inner .item:last').hasClass('active')) {
		$this.children('#game-instructions-back').show();
		$this.children('#game-instructions-next').hide();
		$this.children('#begin-btn').show();
	} else {
		$this.children('.carousel-control').show();
		$this.children('#begin-btn').hide();
	} 
}

function runTutorial(){
	$("#game-tutorial").show();
	$("#game-header").hide();
	var btn = document.getElementById("begin-btn");
	btn.onclick = 
	function (){
		endTutorial();
		GAME_STATE["time"] = getCurrentTime();
		writeToVar();
		initGame();
	}
	$(".carousel").carousel({
		interval: false
	});
	$('#game-instructions-carousel').on('slid', '', checkitem);  // on caroussel move
	$('#game-instructions-carousel').on('slid.bs.carousel', '', checkitem); // on carousel move
	checkitem();
	$("#game-payoff-a").text(CONFIG["payoff"][0][0].toFixed(2));
	$("#game-payoff-b").text((-1 *CONFIG["payoff"][1][0]).toFixed(2));
	$("#game-payoff-c").text(CONFIG["payoff"][0][1].toFixed(2));
	$("#game-max-objects").text(CONFIG["numrounds"]);
}
function endTutorial(){
	GAME_STATE["mode"] = 1;
	$("#game-tutorial").hide("fast");
	$("#game-header").show("fast");
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//function main(){
$(window).on("load", function(){
	var queryParams = ["gameid", "workerid", "hitid", "assignmentid"];
	for (var i = 0; i < queryParams.length; i++){
		var param = queryParams[i];
		GAME_STATE[param] = getParameterByName(param);
		if (GAME_STATE[param] == null){
			throw new Error(param + " is undefined");
		}
	}
	$("#game-loading-msg").text("Please wait. Loading...");
	setTimeout(getGameData, 2000);
});

function sampleWithoutReplacement(arr, numSamples){
	var samples = [];
	var bucket = [];
	for (var i=0; i<arr.length; i++) {
		bucket.push(i);
	}
	for (var i=0; i<numSamples; i++){
		var randomIndex = Math.floor(Math.random()*bucket.length);
		samples.push(arr[bucket.splice(randomIndex, 1)[0]]);
	}
	return samples;
}

function sampleFeatures(){
	var features = Object.keys(CONFIG["features"]);
	var x = {};
	for (j in features){
		var featureName = features[j];
		var featureValue = sampleWithoutReplacement(CONFIG["features"][featureName], 1)[0];
		x[featureName] = featureValue;
	}
	return x;
}

function hfoo(x){
	return Math.round(Math.random());
}

function satisifiesCondition(errorFormula, x){
	var condition = false;
	for (var i=0; i<errorFormula.length; i++){
		var clause = errorFormula[i];
		var literals = Object.keys(clause);
		var count = 0;
		for (var j=0; j<literals.length; j++){
			var featureName = literals[j];
			if (x[featureName] == clause[featureName]){
				count += 1;
			}
		}
		if (count == literals.length){
			condition = true;
		}
	}
	return condition;
}

function h1foo(errorFormula, x, h, sWrong, sRight){
	var condition = satisifiesCondition(errorFormula, x);
	if (condition == true){
		if (Math.random() < sWrong){
			return h;
		}
		return 1 - h;
	}
	else{
		if (Math.random() < sRight){
			return 1-h;
		}
		return h;
	}
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function sampleErrorFormula(key){
	var numConjuncts = CONFIG[key]["numconjuncts"];
	var numLiterals = CONFIG[key]["numliterals"];
	var features = Object.keys(CONFIG["features"]);

	var errorFormula = [];
	var featureValuePairs = [];
	for (var i=0; i<features.length; i++){
		var featureName = features[i];
		var featureValues = CONFIG["features"][featureName];
		for (var j=0; j<featureValues.length; j++){
			featureValuePairs.push([features[i], featureValues[j]]);
		}
	}
	console.log(featureValuePairs);
	//var literals = sampleWithoutReplacement(featureValuePairs, numLiterals * numConjuncts);
	var literals = shuffle(featureValuePairs);
	console.log(JSON.stringify(literals));
	for (var i=0; i<numConjuncts; i++){
		console.log(JSON.stringify(literals));
		var clause = {};
		var idxToRmv = [];
		var j = 0;
		while (Object.keys(clause).length < numLiterals){
			var currentFeatureName = literals[j][0];
			var currentFeatureValue = literals[j][1];
			console.log(currentFeatureName);
			console.log(currentFeatureValue);
			if (currentFeatureName in clause){
				console.log("skipping");
			}
			else{
				console.log("adding");
				clause[currentFeatureName] = currentFeatureValue;
				idxToRmv.push(j);
			}
			j = j + 1;
		}
		for (var j=idxToRmv.length-1; j>=0; j--){
			literals.splice(idxToRmv[j], 1);
		}
		console.log(JSON.stringify(clause));
		errorFormula.push(clause);
	}
	console.log(errorFormula);
	return errorFormula;
}

function isSubset(f1, f2){
	// implemented for 1 clause only
	var clause1 = f1[0];
	var clause2 = f2[0];
	for (key in clause1){
		if (clause1[key] != clause2[key]){
			return false
		}
	}
	return true;
}

function contains(f1, f2){
	var clause1 = f1[0];
	var clause2 = f2[0];
	for (key in clause1){
		if (clause1[key] == clause2[key]){
			return true 
		}
	}
	return false;

}

function generateSamples(key){
	var numRounds = CONFIG["numrounds"];
	if (UPDATE){
		numRounds = numRounds / 2;
	}
	var numConjuncts = CONFIG[key]["numconjuncts"];
	var numLiterals = CONFIG[key]["numliterals"];
	var pErr = 1 - CONFIG[key]["accuracy"];
	var pErrCond = CONFIG[key]["p_err_c"];
	var pErrNotCond = CONFIG[key]["p_err_notc"];
	var features = Object.keys(CONFIG["features"]);
	var numFeatures = features.length;
	// Seed to generate fixed rounds w/ errors 
	//
	var seed = CONFIG["seed"];
	Math.seedrandom(seed);
	console.log("Setting seed" + seed);

	var numErrors = Math.round(numRounds * pErr);
	console.log(numErrors);
	var roundsBucket = [];
	for (i=0; i<numRounds; i++){
		roundsBucket.push(i);
	}
	var errorRounds = sampleWithoutReplacement(roundsBucket, numErrors);
	console.log("errorRounds");
	console.log(errorRounds);

	var pCond = (pErr - pErrNotCond)/(pErrCond - pErrNotCond);

	var pCondAndErr = pCond * pErrCond;
	console.log(pCondAndErr);
	var numCondAndErr = Math.round(numRounds * pCondAndErr)
	var condAndErrRounds = sampleWithoutReplacement(errorRounds, numCondAndErr);
	console.log("numCondAndErr");
	console.log(numCondAndErr);
	console.log(condAndErrRounds);

	var numNotError = numRounds - numErrors;
	var notErrorRounds = [];
	for (i=0; i<numRounds; i++){
		if (!errorRounds.includes(i)){
			notErrorRounds.push(i);
		}
	}
	var pCondAndNotErr = pCond * (1 - pErrCond);
	var numCondAndNotErr = Math.round(numRounds * pCondAndNotErr);
	var condAndNotErrRounds = sampleWithoutReplacement(notErrorRounds, numCondAndNotErr);
	console.log("numCondAndNotErr");
	console.log(numCondAndNotErr);
	console.log(condAndNotErrRounds);

	// Seed by workerid, to generate h1fail and samples
	var seed = GAME_STATE["workerid"];
	Math.seedrandom(seed);
	console.log("Setting seed" + seed);

	var baseErrorFormula = sampleErrorFormula("base");
	if (UPDATE & key == "updated"){
		var updatestyle = CONFIG["updatestyle"];
		if (updatestyle == "no-change"){
			errorFormula = baseErrorFormula;
		}
		else if (updatestyle == "subset"){
			var errorFormula = sampleErrorFormula("updated");
			while (!isSubset(baseErrorFormula, errorFormula)){
				errorFormula = sampleErrorFormula("updated");
			}
		}
		else if (updatestyle == "nointersection"){
			var errorFormula = sampleErrorFormula("updated");
			while (contains(baseErrorFormula, errorFormula)){
				errorFormula = sampleErrorFormula("updated");
			}
		}
		console.log("updated" + JSON.stringify(errorFormula));
	}
	else{
		errorFormula = baseErrorFormula;
		console.log("Base" + JSON.stringify(errorFormula));
	}

	for (var i=0; i<numRounds; i++){
		var x = sampleFeatures();
		var h = hfoo(x);
		var h1;
		if (errorRounds.includes(i)){
			h1 = 1 - h;	
			if (condAndErrRounds.includes(i)){
				while (!satisifiesCondition(errorFormula, x)){
					x = sampleFeatures();
				}
			}
			else{
				while (satisifiesCondition(errorFormula, x)){
					x = sampleFeatures();
				}
			}
		}
		else {
			h1 = h;	
			if (condAndNotErrRounds.includes(i)){
				while (!satisifiesCondition(errorFormula, x)){
					x = sampleFeatures();
				}
			}
			else{
				while (satisifiesCondition(errorFormula, x)){
					x = sampleFeatures();
				}
			}
		}
		SAMPLES[key].push({
			"features": x,
			"h": h,
			"h1": h1,
			"h1fail": errorFormula
		});
	}
}

function generateCode(){
	Math.seedrandom(GAME_STATE["assignmentid"]);
	return Math.floor((Math.random() * 9999) + 1000);
}

function getGameData(){
	//initGraphics();
	var url = "/game/" + GAME_STATE["gameid"] + "/" + GAME_STATE["workerid"]; 
	$.ajax({
		type: "GET",
		url: url,
		cache: false,
		dataType : "json",
		timeout: 30000,
		success: function(data){
			console.log(data);
			CONFIG = data["config"];
			if (CONFIG["updated"] != undefined){
				UPDATE = true;
			}
			var lastRound = data["round"];
			generateSamples("base");
			if (UPDATE){
				generateSamples("updated");
			}
			CODE = generateCode();
			GAME_STATE["code"] = CODE;
			$("#game-loading-msg").text("Loading complete...");
			$("#game-loading").hide();
			$("#game-area").show();
			//GAME_STATE["mode"] = 0;
			if (lastRound != null){
				GAME_STATE["mode"] = 1;
				GAME_STATE["round"] = data["round"];
				GAME_STATE["score"] = data["score"];
			}
			runGame();
		},
		error: function(xhr, status, error){
			throw new Error("Issue with loading " + GAME_STATE["gameid"]);
		}
	});
}

function runGame(){
	if (GAME_STATE["mode"] == 0){
		runTutorial();
	}
	else{
		endTutorial();
		initGame();
	}
}
