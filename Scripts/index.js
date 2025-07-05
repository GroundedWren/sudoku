/**
 * @file Index page scripts
 * @author Vera Konigin vera@groundedwren.com
 */

window.addEventListener("load", () => {
	GW.Display.updatePrefs();

	const shortsGame = document.getElementById("shortsGame");
	shortsGame.addEventListener("focusin", GW.Sudoku.onGameFocusin);
	shortsGame.addEventListener("focusout", GW.Sudoku.onGameFocusout);

	GW.Sudoku.Data = JSON.parse(localStorage.getItem("data"));
	if(!GW.Sudoku.Data) {
		GW.Sudoku.generateGameData();
	}
	GW.Sudoku.renderGame();
});