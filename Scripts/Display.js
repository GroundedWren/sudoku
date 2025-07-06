/**
 * @file Display scripts
 * @author Vera Konigin vera@groundedwren.com
 */
 
window.GW = window.GW || {};
window.GW.Sudoku = window.GW.Sudoku || {};
(function Generator(ns) {
	ns.updatePrefs = function updatePrefs() {
		const cbxDarkMode = document.getElementById("cbxDarkMode");
		const theme = localStorage.getItem("theme");
		switch(theme) {
			case "light":
				cbxDarkMode.checked = false;
				break;
			case "dark":
				cbxDarkMode.checked = true;
				break;
			default:
				cbxDarkMode.checked = window.matchMedia("(prefers-color-scheme: dark)").matches;
				break;
		}
		document.documentElement.classList.toggle("theme-dark", cbxDarkMode.checked);

		const cbxShowCrosshairs = document.getElementById("cbxShowCrosshairs");
		const hideCrosshairs = localStorage.getItem("hide-crosshairs") === "true";
		cbxShowCrosshairs.checked = !hideCrosshairs;
		GW.Sudoku.applyCrosshairs();

		const cbxBorderColors = document.getElementById("cbxBorderColors");
		const noBorderColors = localStorage.getItem("no-border-colors") !== "false";
		cbxBorderColors.checked = !noBorderColors;
		document.documentElement.classList.toggle("no-border-colors", noBorderColors);

		const cbxSquareColors = document.getElementById("cbxSquareColors");
		const noSquareColors = localStorage.getItem("no-square-colors") === "true";
		cbxSquareColors.checked = !noSquareColors;
		document.documentElement.classList.toggle("no-square-colors", noSquareColors);

		const cbxLockIcons = document.getElementById("cbxLockIcons");
		const noLockIcons = localStorage.getItem("no-lock-icons") !== "false";
		cbxLockIcons.checked = !noLockIcons;
		document.documentElement.classList.toggle("no-lock-icons", noLockIcons);

		const cbxNumberColors = document.getElementById("cbxNumberColors");
		const noNumberColors = localStorage.getItem("no-number-colors") === "true";
		cbxNumberColors.checked = !noNumberColors;
		document.documentElement.classList.toggle("no-number-colors", noNumberColors);
	}
}) (window.GW.Sudoku.Display = window.GW.Sudoku.Display || {});