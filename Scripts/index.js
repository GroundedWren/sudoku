/**
 * @file Index page scripts
 * @author Vera Konigin vera@groundedwren.com
 */

window.addEventListener("load", () => {
	GW.Sudoku.Display.updatePrefs();

	const shortsGame = document.getElementById("shortsGame");
	shortsGame.addEventListener("focusin", GW.Sudoku.onGameFocusin);
	shortsGame.addEventListener("focusout", GW.Sudoku.onGameFocusout);

	const olbValue = document.getElementById("olbValue");
	olbValue.addEventListener("option-click", GW.Sudoku.saveBoundCell);

	const clbPencil = document.getElementById("clbPencil");
	clbPencil.addEventListener("option-click", GW.Sudoku.saveBoundCell);

	const numHints = parseInt(localStorage.getItem("num-hints")) || 38;
	localStorage.setItem("num-hints", numHints);
	document.getElementById("numHints").value = numHints;
	GW.Sudoku.Data = JSON.parse(localStorage.getItem("data"));
	if(!GW.Sudoku.Data) {
		GW.Sudoku.generateGameData();
	}
	GW.Sudoku.clearInvalidFlags();
	GW.Sudoku.renderGame();
});