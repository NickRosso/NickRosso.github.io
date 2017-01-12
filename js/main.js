var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio - 100, window.innerHeight * window.devicePixelRatio - 100, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var buttonStyle = {font: 'Nueva Std', fontSize: '28px', fill: '#FFFFFF'};


function preload(){
	game.load.image('background', 'assets/cornfieldbackground.png');
	game.load.spritesheet('cornclick', 'assets/clickbutton.png',275,85);
	game.load.image('ground', 'assets/platform.png');
	game.load.spritesheet('upgradecornclick', 'assets/upgradebutton.png',310, 144);
	game.load.spritesheet('upgradecornrate', 'assets/upgradebuttonright.png',310,144);

	game.load.image('cornkernel', 'assets/kernels.png');
	game.load.image('goldenkernel', 'assets/goldenkernel.png');
	game.load.image('deletesave', 'assets/deleteSave.png');
}

function create(){
	loadGame();
	game.stage.disableVisibilityChange = true;
	game.physics.startSystem(Phaser.Physics.Arcade)
	background = game.add.tileSprite(0,0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, 'background');
	
	platforms = game.add.group();
	platforms.enableBody = true;

	fallingCorn = game.add.group();
	fallingCorn.enableBody = true;

	var cornDrawLimit = platforms.create(0, game.world.height - 64, 'ground');
	cornDrawLimit.scale.setTo(2,2);
	cornDrawLimit.body.immovable = true;

	cornClick = game.add.button(game.world.centerX - 140, game.world.centerY + 130, 'cornclick', generateCorn, this, 2,1,0);
	upgradeClick = game.add.button(game.world.centerX - 320, game.world.centerY + 230, 'upgradecornclick', upgradeClickLevel, this, 2, 1, 0);
	upgradeCornRate = game.add.button(game.world.centerX , game.world.centerY + 230, 'upgradecornrate', upgradeCornGainRate, this, 2, 1, 0);
	deleteSaveButton = game.add.button(0, game.world.height - 65, 'deletesave', initGameData , this, 2, 1, 0);

	totalCornText = game.add.text(16, 16, 'Corn: '+ formatNumber(gameData.totalCorn), {font: 'Nueva Std', fontSize: '60px', fill: '#e7ea73'} );

	clickText = game.add.text(game.world.centerX - 240, game.world.centerY + 250, 'Upgrade CPC', {font: 'Nueva Std', fontSize: '32px', fill: '#000000'} );
	cornPerClickText = game.add.text(game.world.centerX - 290, game.world.centerY + 280, 'Corn Per Click: ' + formatNumber(gameData.cornPerClick), buttonStyle);
	clickLevelCostText = game.add.text(game.world.centerX - 290, game.world.centerY + 305, 'Cost: ' + formatNumber(gameData.upgradeClickCost), buttonStyle);
	cornPerClickLevelText = game.add.text(game.world.centerX - 290, game.world.centerY + 330,'Level: '+ formatNumber(gameData.cornPerClickLevel), buttonStyle);

	idleText = game.add.text(game.world.centerX + 80, game.world.centerY + 250, 'Upgrade CPS', {font: 'Nueva Std', fontSize: '32px', fill: '#000000'});
	cornGainRateText = game.add.text(game.world.centerX + 30, game.world.centerY + 280, 'Corn Per Second: ' + formatNumber(gameData.cornGainRate), buttonStyle);
	cornRateLevelCostText = game.add.text(game.world.centerX + 30, game.world.centerY + 305,'Cost: '+ formatNumber(gameData.upgradeCornRateCost), buttonStyle);
	cornRateLevelText = game.add.text(game.world.centerX + 30, game.world.centerY + 330,'Level: '+ formatNumber(gameData.cornGainRateLevel), buttonStyle);

	game.time.events.loop(Phaser.Timer.SECOND, renderCorn, this);
	game.time.events.loop(Phaser.Timer.SECOND, saveGame, this);
	game.time.events.loop(Phaser.Timer.SECOND / 5, updateButtonDetails, this);
	game.time.events.loop(Phaser.Timer.SECOND * (Math.random() * 40) , spawnGoldenCorn,this);

}

function update(){
	game.physics.arcade.overlap(fallingCorn, platforms, killCorn, null, this);
	
}


function generateCorn() {
	gameData.totalCorn += gameData.cornPerClick;
	totalCornText.text = 'Corn: ' + formatNumber(gameData.totalCorn);
}

function upgradeClickLevel(){
	if(gameData.totalCorn >= gameData.upgradeClickCost){
		gameData.cornPerClickLevel++;
		gameData.cornPerClick+= Math.round(Math.floor(1 * Math.pow(1.1,gameData.cornPerClickLevel)));
		gameData.totalCorn -= gameData.upgradeClickCost;
		gameData.upgradeClickCost = Math.floor(10 * Math.pow(1.5, gameData.cornPerClickLevel));
		if(gameData.cornPerClickLevel % 25 == 0)
			gameData.cornPerClick *= 2;
		}
}

function upgradeCornGainRate(){
	if(gameData.totalCorn >= gameData.upgradeCornRateCost){
		gameData.cornGainRateLevel++;
		gameData.cornGainRate+= Math.round(Math.floor(1 * Math.pow(1.2,gameData.cornGainRateLevel)));
		gameData.totalCorn -= gameData.upgradeCornRateCost;
		gameData.upgradeCornRateCost = Math.floor(25 * Math.pow(1.5, gameData.cornGainRateLevel));
	}
}

function renderCorn(){

	for (var i = 0; i < gameData.cornGainRateLevel; i++)
	{
		var cornImage = fallingCorn.create(Math.random() * window.innerWidth, -50, 'cornkernel');
		cornImage.body.gravity.y = Math.random() * 100 + 50;
	}
	gameData.totalCorn += gameData.cornGainRate;
}

function saveGame(){
	gameData.onlineTime = Math.round(new Date() / 1000);
	localStorage.setItem("savedData", JSON.stringify(gameData));
}

function loadGame(){
	var savedData = JSON.parse(localStorage.getItem("savedData"));
	
	if(localStorage.getItem("savedData") == null || savedData.offlineProgressionModifiers === "undefined"){
		console.log("No Save Detected");
		initGameData();
	}
	else {
		gameData = {
			totalCorn: savedData.totalCorn,

			cornPerClickLevel: savedData.cornPerClickLevel,
			cornPerClick: savedData.cornPerClick,
			upgradeClickCost: savedData.upgradeClickCost,
			cornGainRateLevel: savedData.cornGainRateLevel,
			cornGainRate: savedData.cornGainRate,
			upgradeCornRateCost: savedData.upgradeCornRateCost,
			onlineTime: Math.round(new Date() / 1000)
		}
		offlineProgression();
	}
}

function initGameData(){
	localStorage.removeItem("savedData");
	gameData = {
		totalCorn: 0,

		cornPerClickLevel: 1,
		cornPerClick: 1,
		upgradeClickCost: 10,

		cornGainRateLevel: 1,
		cornGainRate: 1,
		upgradeCornRateCost: 25,

		onlineTime: Math.round(new Date() / 1000)
	}
	localStorage.setItem("savedData", JSON.stringify(gameData));
	console.log("Save Formatted");
}

function updateButtonDetails(){
	clickLevelCostText.text = 'Cost: ' + formatNumber(gameData.upgradeClickCost);
	cornPerClickText.text = 'Corn Per Click: ' + formatNumber(gameData.cornPerClick);
	cornPerClickLevelText.text = 'Level: ' + formatNumber(gameData.cornPerClickLevel);

	cornRateLevelCostText.text = 'Cost: ' + formatNumber(gameData.upgradeCornRateCost);
	cornGainRateText.text = 'Corn Per Second: ' + formatNumber(gameData.cornGainRate);
	cornRateLevelText.text = 'Level: ' + formatNumber(gameData.cornGainRateLevel);

	totalCornText.text = 'Corn: ' + formatNumber(gameData.totalCorn);

}
function killCorn(cornImage){
	cornImage.kill();
}

function formatNumber(number){
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function offlineProgression(){
	var timeSinceLastPlayed = (Math.round(new Date() / 1000 ) - gameData.onlineTime);
	var offlineGains = timeSinceLastPlayed * gameData.cornGainRate;
	gameData.totalCorn += offlineGains;
	console.log("Corn gained since last offline " + offlineGains);
}

function spawnGoldenCorn(){
	var goldCornImage = fallingCorn.create(Math.random() * window.innerWidth, -50, 'goldenkernel');
	goldCornImage.body.gravity.y = Math.random() * 100 + 50;
	goldCornImage.inputEnabled = true;
	goldCornImage.events.onInputDown.add(goldCornReward,this);

}
function goldCornReward(goldCornImage){
	var reward = (gameData.cornGainRate + gameData.cornPerClick) * 1000;
	gameData.totalCorn += reward;
	goldCornImage.kill();
}