/**
 * @file Sudoku scripts
 * @author Vera Konigin vera@groundedwren.com
 */
 
window.GW = window.GW || {};
(function Sudoku(ns) {
	ns.Data;

	ns.onNewGame = (event) => {
		event.preventDefault();

		generateGameData();
		ns.renderGame();
	};
	ns.generateGameData = function generateGameData() {
		ns.Data = [];

		for(let i = 0; i < 9; i++) {
			ns.Data[i] = [];
			for(let j = 0; j < 9; j++) {
				ns.Data[i][j] = { Number: null, Locked: false };
			}
		}
	}

	ns.renderGame = function renderGame() {
		ns.CellEl.ActionBatcher.addListener("onRender", onRender);

		const secGame = document.getElementById("secGame");
		secGame.innerHTML = `${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(squareIdx => 
			`<table role="grid" aria-labelledby="spnSquareLbl-${squareIdx + 1}">
				<tbody>${[0, 1, 2].map(rowIdx =>
					`<tr>${[0, 1, 2].map(colIdx => 
						`<td><gw-cell
							aria-selected="false"
							tabindex="${!squareIdx && !rowIdx && !colIdx ? "0" : "-1"}"
							data-row="${Math.floor(squareIdx / 3) * 3 + rowIdx}"
							data-col="${(squareIdx % 3) * 3 + colIdx}"
						></gw-cell></td>`).join("\n")}
					</tr>`).join("\n")}
				</tbody>
			</table>`
		).join("\n")}`;
	};

	const onRender = () => {
		localStorage.setItem("data", JSON.stringify(ns.Data));
	};

	ns.onGameFocusin = () => {
		document.getElementById("asiGame").style["visibility"] = "visible";

		const prevCell = secGame.querySelector(`gw-cell[aria-selected="true"]`);
		prevCell?.setAttribute("aria-selected", "false");
		prevCell?.setAttribute("tabindex", "-1");

		const focusedCell = secGame.querySelector(`gw-cell:focus`);
		focusedCell.setAttribute("aria-selected", "true");
		focusedCell.setAttribute("tabindex", "0");
		rebindCellForm(focusedCell);
	};

	ns.onGameFocusout = () => {
		document.getElementById("asiGame").style["visibility"] = "hidden";
	};

	ns.onGameKbdNav = (event) => {
		const currentCell = document.querySelector(`gw-cell[aria-selected="true"]`);
		let row = currentCell.Row;
		let col = currentCell.Col;

		switch(event.key) {
			case "ArrowLeft":
				col -= 1;
				break;
			case "ArrowRight":
				col += 1;
				break;
			case "ArrowUp":
				row -= 1;
				break;
			case "ArrowDown":
				row += 1;
				break;
			case "Home":
				col -= 3;
				break;
			case "End":
				col += 3;
				break;
			case "PageUp":
				row -= 3;
				break;
			case "PageDown":
				row += 3;
				break;
		}

		row = Math.min(Math.max(row, 0), 8);
		col = Math.min(Math.max(col, 0), 8);
		focusGameCell(row, col);
	};

	function focusGameCell(rowIdx, colIdx) {
		document.querySelector(`gw-cell[data-row="${rowIdx}"][data-col="${colIdx}"]`).focus();
	}

	let formBoundCell = null;
	function rebindCellForm(cell) {
		formBoundCell = cell;
		//Update UI
	}

	ns.onCellFocus = () => {};
}) (window.GW.Sudoku = window.GW.Sudoku || {});