/**
 * @file Display scripts
 * @author Vera Konigin vera@groundedwren.com
 */
 
window.GW = window.GW || {};
(function Display(ns) {
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
	}
}) (window.GW.Display = window.GW.Display || {});