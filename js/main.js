/*
Code Written By Nicholas Daniel Rosso

This file is part of Corn Clicker.

    Corn Clicker is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Corn Clicker is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Corn Clicker.  If not, see <http://www.gnu.org/licenses/>.

Description: This program is a incremental clicker game created using the phaser game library
*/
var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio - 100, window.innerHeight * window.devicePixelRatio - 100, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var buttonStyle = {font: 'Nueva Std', fontSize: '28px', fill: '#FFFFFF'};
var reg = {};
//Loading Assets
function preload(){
	game.load.image('background', 'assets/cornfieldbackground.png');
	game.load.spritesheet('cornclick', 'assets/clickbutton.png',275,85);
	game.load.image('ground', 'assets/platform.png');
	game.load.spritesheet('upgradecornclick', 'assets/upgradebutton.png',310, 144);
	game.load.spritesheet('upgradecornrate', 'assets/upgradebuttonright.png',310,144);
	game.load.image('cornkernel', 'assets/kernels.png');
	game.load.image('goldenkernel', 'assets/goldenKernel.png');
	game.load.image('deletesave', 'assets/deleteSave.png');


}
//Starts game objects, groups, and initializes save data as well as buttons, and text
function create(){
	loadGame();
	
	//Currently not working as planned will look into it later
	game.stage.disableVisibilityChange = true;
	
	//Enables physics for falling corn
	game.physics.startSystem(Phaser.Physics.Arcade)
	
	//sets background image to bet the width of window and height when game initialized
	background = game.add.tileSprite(0,0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, 'background');
	
	//used for removing corn objects from game to free up memory
	platforms = game.add.group();
	platforms.enableBody = true;

	fallingCorn = game.add.group();
	fallingCorn.enableBody = true;

	modifiers = game.add.group();
	
	//Creates a platform that kills corn when the images overlap
	var cornDrawLimit = platforms.create(0, game.world.height - 64, 'ground');
	cornDrawLimit.scale.setTo(2,2);
	cornDrawLimit.body.immovable = true;

	//Game buttons
	cornClick = game.add.button(game.world.centerX - 140, game.world.centerY + 130, 'cornclick', generateCorn, this, 2,1,0);
	
	cornClick.events.onInputDown.add(function() {
		new FloatingText(this, {
			text: '+' + formatNumber(gameData.cornPerClick),
			animation: "up",
			textOptions: {
				fontSize: 30,
				fill: "#e7ea73",
				font: 'Nueva Std'
			},
			x: game.world.centerX - 240,
			y: game.world.centerY + 230,
			timeToLive: 100//ms
			})
		},this);
	
	upgradeClick = game.add.button(game.world.centerX - 320, game.world.centerY + 230, 'upgradecornclick', upgradeClickLevel, this, 2, 1, 0);
	upgradeCornRate = game.add.button(game.world.centerX , game.world.centerY + 230, 'upgradecornrate', upgradeCornGainRate, this, 2, 1, 0);
	deleteSaveButton = game.add.button(0, game.world.height - 65, 'deletesave', initGameData , this, 2, 1, 0);
	//text on buttons and total corn
	totalCornText = game.add.text(16, 16, 'Corn: '+ formatNumber(gameData.totalCorn), {font: 'Nueva Std', fontSize: '60px', fill: '#e7ea73'} );
	clickText = game.add.text(game.world.centerX - 240, game.world.centerY + 250, 'Upgrade CPC', {font: 'Nueva Std', fontSize: '32px', fill: '#000000'} );
	cornPerClickText = game.add.text(game.world.centerX - 290, game.world.centerY + 280, 'Corn Per Click: ' + formatNumber(gameData.cornPerClick), buttonStyle);
	clickLevelCostText = game.add.text(game.world.centerX - 290, game.world.centerY + 305, 'Cost: ' + formatNumber(gameData.upgradeClickCost), buttonStyle);
	cornPerClickLevelText = game.add.text(game.world.centerX - 290, game.world.centerY + 330,'Level: '+ formatNumber(gameData.cornPerClickLevel), buttonStyle);
	
	idleText = game.add.text(game.world.centerX + 80, game.world.centerY + 250, 'Upgrade CPS', {font: 'Nueva Std', fontSize: '32px', fill: '#000000'});
	cornGainRateText = game.add.text(game.world.centerX + 30, game.world.centerY + 280, 'Corn Per Second: ' + formatNumber(gameData.cornGainRate), buttonStyle);
	cornRateLevelCostText = game.add.text(game.world.centerX + 30, game.world.centerY + 305,'Cost: '+ formatNumber(gameData.upgradeCornRateCost), buttonStyle);
	cornRateLevelText = game.add.text(game.world.centerX + 30, game.world.centerY + 330,'Level: '+ formatNumber(gameData.cornGainRateLevel), buttonStyle);
	cornMultiplierText = game.add.text(16, 80, 'Multiplier: '+ gameData.cornMultiplier + '.00x', {font: 'Nueva Std', fontSize: '40px', fill: '#e7ea73'});

	//timer events
	game.time.events.loop(Phaser.Timer.SECOND, renderCorn, this);
	game.time.events.loop(Phaser.Timer.SECOND, saveGame, this);
	game.time.events.loop(Phaser.Timer.SECOND / 5, updateButtonDetails, this);
	game.time.events.loop(Phaser.Timer.SECOND * 150 , spawnGoldenCorn, this);

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
		gameData.cornPerClick+= Math.round(Math.floor(1 * Math.pow(1.2,gameData.cornPerClickLevel)));
		gameData.totalCorn -= gameData.upgradeClickCost;
		gameData.upgradeClickCost = Math.floor(10 * Math.pow(1.5, gameData.cornPerClickLevel));
		if(gameData.cornPerClickLevel % 10 == 0){
			gameData.cornMultiplier += 1;
			gameData.cornPerClick *= gameData.cornMultiplier;
		}

	}
}

function upgradeCornGainRate(){
	if(gameData.totalCorn >= gameData.upgradeCornRateCost){
		gameData.cornGainRateLevel++;
		gameData.cornGainRate+= Math.round(Math.floor(1 * Math.pow(1.2,gameData.cornGainRateLevel)));
		gameData.totalCorn -= gameData.upgradeCornRateCost;
		gameData.upgradeCornRateCost = Math.floor(25 * Math.pow(1.5, gameData.cornGainRateLevel));
		if(gameData.cornGainRateLevel % 10 == 0){
			gameData.cornMultiplier += 1;
			gameData.cornGainRate *= gameData.cornMultiplier;
		}
		
	}
}

function renderCorn(){
	//Draws multiple corn based on IDLE level
	if(gameData.cornGainRateLevel > 25)
		var cornPerDraw = 25;
	else
		var cornPerDraw = gameData.cornGainRateLevel;

	for (var i = 0; i < cornPerDraw; i++)
	{
		var cornImage = fallingCorn.create(Math.random() * window.innerWidth, -50, 'cornkernel');
		//gives corn image object a random gravity
		cornImage.body.gravity.y = Math.random() * 100 + 50;
		//Adds a fade in and fade out effect to corn
		cornImage.alpha = 0;
		game.add.tween(cornImage).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 100, 1000, true);
	}

	gameData.totalCorn += gameData.cornGainRate;
		new FloatingText(this, {
			text: '+' + formatNumber(gameData.cornGainRate),
			animation: 'up',
			textOptions: {
				fontSize: 30,
				fill: "#e7ea73",
				font: 'Nueva Std'
			},
			x: (game.world.centerX + 200),
			y: (game.world.centerY + 230),
			timeToLive: 200 //ms
			});
}

function saveGame(){
	//saves current time in miliseconds to be used in calculating time offline
	gameData.onlineTime = Math.round(new Date() / 1000);
	//sets the "savedData" Hash as the values of gameData
	localStorage.setItem("savedData", JSON.stringify(gameData));
}
//Function loads object from local storage if it exists it initializes data members if not it sets everything back to its base
function loadGame(){
	var savedData = JSON.parse(localStorage.getItem("savedData"));
	
	if(localStorage.getItem("savedData") == null){
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
			onlineTime: savedData.onlineTime,
			cornMultiplier: savedData.cornMultiplier
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
		cornMultiplier: 1,

		onlineTime: Math.round(new Date() / 1000)
	}
	localStorage.setItem("savedData", JSON.stringify(gameData));
	console.log("Save Formatted");
}
//Updates dynamic text on buttons
function updateButtonDetails(){
	clickLevelCostText.text = 'Cost: ' + formatNumber(gameData.upgradeClickCost);
	cornPerClickText.text = 'Corn Per Click: ' + formatNumber(gameData.cornPerClick);
	cornPerClickLevelText.text = 'Level: ' + formatNumber(gameData.cornPerClickLevel);

	cornRateLevelCostText.text = 'Cost: ' + formatNumber(gameData.upgradeCornRateCost);
	cornGainRateText.text = 'Corn Per Second: ' + formatNumber(gameData.cornGainRate);
	cornRateLevelText.text = 'Level: ' + formatNumber(gameData.cornGainRateLevel);

	totalCornText.text = 'Corn: ' + formatNumber(gameData.totalCorn);
	cornMultiplierText.text = 'Multiplier: ' + gameData.cornMultiplier + '.00x';

}
function killCorn(cornImage){
	cornImage.kill();
}
//Formats strings to have ,
function formatNumber(number){
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
//Calculates offline time
function offlineProgression(){
	var timeSinceLastPlayed = (Math.round(new Date() / 1000 ) - gameData.onlineTime);
	var offlineGains = timeSinceLastPlayed * gameData.cornGainRate;
	gameData.totalCorn += offlineGains;
	console.log("Corn gained since last offline " + offlineGains);
}
//random game event that yields high reward if clicked
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
