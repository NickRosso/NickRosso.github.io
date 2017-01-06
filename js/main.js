var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var style = { font: 'Nueva Std', fontSize: '60px', fill: '#e7ea73'};
var buttonStyle = {font: 'Nueva Std', fontSize: '32px', fill: '#159146'};


function preload(){
	game.load.image('background', 'assets/cornfieldbackground.png');
	game.load.image('cornclick', 'assets/clickbutton.png');
	game.load.image('upgradecornclick', 'assets/upgradebutton.png');
	game.load.image('cornkernel', 'assets/kernels.png');
	game.load.image('deletesave', 'assets/deleteSave.png')
}

function create(){
	loadGame();
	game.stage.backgroundColor = '#e7ea73';
	game.stage.disableVisibilityChange = true;
	game.physics.startSystem(Phaser.Physics.Arcade)

	background = game.add.tileSprite(0,0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, 'background');

	cornClick = game.add.button(game.world.centerX - 170, game.world.centerY - 60, 'cornclick', generateCorn, this, 2,1,0);
	upgradeClick = game.add.button(game.world.centerX - 320, game.world.centerY + 30, 'upgradecornclick', upgradeClickLevel, this, 2, 1, 0);
	upgradeCornRate = game.add.button(game.world.centerX , game.world.centerY + 30, 'upgradecornclick', upgradeCornGainRate, this, 2, 1, 0);
	deleteSaveButton = game.add.button(0, game.world.height - 100, 'deletesave', deleteGameData, this, 2, 1, 0);
	totalCornText = game.add.text(16, 16, 'Corn: '+ gameData.totalCorn, style);

	clickLevelInfoText = game.add.text(game.world.centerX - 250, game.world.centerY + 40, '+ Corn Per Click', buttonStyle);
	clickLevelText = game.add.text(game.world.centerX - 300, game.world.centerY + 65, 'Corn Per Click: ' + gameData.cornClickLevel, buttonStyle);
	clickLevelCostText = game.add.text(game.world.centerX - 300, game.world.centerY + 90, 'Cost: ' + gameData.upgradeClickCost, buttonStyle);

	cornRateLevelInfoText = game.add.text(game.world.centerX + 50, game.world.centerY + 40, '+ Corn Per Second', buttonStyle);
	cornRateLevelText = game.add.text(game.world.centerX + 10, game.world.centerY + 65, 'Corn Per Second: ' + gameData.cornGainRateLevel, buttonStyle);
	cornRateLevelCostText = game.add.text(game.world.centerX + 10, game.world.centerY + 90,'Cost: '+ gameData.upgradeCornRateCost, buttonStyle);

	game.time.events.loop(Phaser.Timer.SECOND, cornGainRate, this);
	game.time.events.loop(Phaser.Timer.SECOND * 2, renderCorn, this);
	game.time.events.loop(Phaser.Timer.SECOND, saveGame,this);
}

function update(){



}


function generateCorn() {
	gameData.totalCorn += gameData.cornClickLevel;
	totalCornText.text = 'Corn: ' + gameData.totalCorn;
}

function upgradeClickLevel(){
	if(gameData.totalCorn >= gameData.upgradeClickCost){
		gameData.cornClickLevel++;
		gameData.totalCorn -= gameData.upgradeClickCost;
		gameData.upgradeClickCost = Math.floor(10 * Math.pow(1.5, gameData.cornClickLevel));
		clickLevelCostText.text = 'Cost: ' + gameData.upgradeClickCost;
		clickLevelText.text = 'Corn Per Click: ' + gameData.cornClickLevel;
		totalCornText.text = 'Corn: ' + gameData.totalCorn;
	}
}

function upgradeCornGainRate(){
	if(gameData.totalCorn >= gameData.upgradeCornRateCost){
		gameData.cornGainRateLevel++;
		gameData.totalCorn -= gameData.upgradeCornRateCost;
		gameData.upgradeCornRateCost = Math.floor(25 * Math.pow(1.5, gameData.cornGainRateLevel));
		cornRateLevelCostText.text = 'Cost: ' + gameData.upgradeCornRateCost;
		cornRateLevelText.text = 'Corn Per Second: ' + gameData.cornGainRateLevel;
		totalCornText.text = 'Corn: ' + gameData.totalCorn;
	}
}

function cornGainRate(){
	gameData.totalCorn += gameData.cornGainRateLevel;
	totalCornText.text = 'Corn: ' + gameData.totalCorn;

}

function renderCorn(){
	fallingCorn = game.add.group();
	fallingCorn.enableBody = true;

	for (var i = 0; i < gameData.cornGainRateLevel; i++)
	{
		var cornImage = fallingCorn.create(Math.random() * window.innerWidth, - 150, 'cornkernel');
		cornImage.body.gravity.y = Math.random() * 100 + 50;
	}
}

function saveGame(){
	localStorage.setItem("savedData", JSON.stringify(gameData));
}

function loadGame(){
	var savedData = JSON.parse(localStorage.getItem("savedData"));
	if(savedData == null){
		console.log("No Save Detected");
		deleteGameData();
	} else {
		gameData = savedData;
	}
}

function deleteGameData(){
	localStorage.removeItem("savedData");
	gameData = {
		totalCorn: 0,
		cornClickLevel: 1,
		upgradeClickCost: 10,
		cornGainRateLevel: 1,
		upgradeCornRateCost: 25
	}
	localStorage.setItem("savedData", JSON.stringify(gameData));
	console.log("Save Formatted");
}