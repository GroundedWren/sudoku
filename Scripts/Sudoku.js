/**
 * @file Sudoku scripts
 * @author Vera Konigin vera@groundedwren.com
 */
 
window.GW = window.GW || {};
(function Sudoku(ns) {
	ns.Data;

	ns.onNewGame = (event) => {
		event.preventDefault();

		ns.generateGameData();
		ns.renderGame();
	};
	ns.generateGameData = function generateGameData() {
		ns.Data = [];

		for(let i = 0; i < 9; i++) {
			ns.Data[i] = [];
			for(let j = 0; j < 9; j++) {
				ns.Data[i][j] = { Number: null, Locked: false, Pencil: [] };
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
						`<td
							aria-selected=${!squareIdx && !rowIdx && !colIdx ? "true" : "false"}
							tabindex=${!squareIdx && !rowIdx && !colIdx ? "0" : "-1"}
						><gw-cell
							data-squ="${squareIdx}"
							data-row="${Math.floor(squareIdx / 3) * 3 + rowIdx}"
							data-col="${(squareIdx % 3) * 3 + colIdx}"
						></gw-cell></td>`).join("\n")}
					</tr>`).join("\n")}
				</tbody>
			</table>`
		).join("\n")}`;

		rebindCell(secGame.querySelector(`td[aria-selected="true"]`));
	};

	const onRender = () => {
		localStorage.setItem("data", JSON.stringify(ns.Data));
	};

	ns.onGameFocusin = () => {
		document.getElementById("asiGame").style["visibility"] = "visible";

		const prevCell = secGame.querySelector(`td[aria-selected="true"]`);
		prevCell?.setAttribute("aria-selected", "false");
		prevCell?.setAttribute("tabindex", "-1");

		const focusedCell = secGame.querySelector(`td:focus`);
		focusedCell.setAttribute("aria-selected", "true");
		focusedCell.setAttribute("tabindex", "0");
		rebindCell(focusedCell);
	};

	ns.onGameFocusout = () => {
		document.getElementById("asiGame").style["visibility"] = "hidden";
	};

	ns.onGameKbdNav = (event) => {
		const currentCell = document.querySelector(`td[aria-selected="true"] gw-cell`);
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
		document.querySelector(
			`td:has([data-row="${rowIdx}"][data-col="${colIdx}"])`
		).focus();
	}

	let formBoundCell = null;
	function rebindCell(cell) {
		const newCell = cell.querySelector(`gw-cell`);
		if(formBoundCell === newCell) {
			return;
		}

		formBoundCell = newCell;
		applyCrosshairs(formBoundCell);

		cellData = formBoundCell.getData();

		document.getElementById("hCell").innerText = `Cell ${formBoundCell.Coords}`;

		const olbValue = document.getElementById("olbValue");
		olbValue.querySelector(`fieldset`).innerHTML = `
			<legend style="display: none;">Value</legend>
			${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number =>
				`<label>
					<input type="radio" name="value" value="${number}" ${ number === cellData.Number ? "checked" : ""}>
					${number}
				</label>`
			).join("\n")}
		`;

		const clbPencil = document.getElementById("clbPencil");
		clbPencil.querySelector(`fieldset`).innerHTML = `
			<legend>Pencil</legend>
			${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number =>
				`<label>
					<input type="checkbox" value="${number}" ${ cellData.Pencil.includes(number) ? "checked" : ""}>
					${number}
				</label>`
			).join("\n")}
		`;

		const spnLocked = document.getElementById("spnLocked");
		if(cellData.Locked) {
			spnLocked.classList.remove("hidden");
			olbValue.classList.add("hidden");
			clbPencil.classList.add("hidden");
		}
		else {
			spnLocked.classList.add("hidden");
			olbValue.classList.remove("hidden");
			clbPencil.classList.remove("hidden");
		}
	}

	ns.quickSelect = (value) => {
		if(formBoundCell.getData().Locked) {
			return;
		}

		const radValue = document.querySelector(`input[name="value"][value="${value}"]`);
		radValue.checked = !radValue.checked;
		ns.saveBoundCell();
	}

	ns.saveBoundCell = () => {
		const data = formBoundCell.getData();

		const selectedValueBtn =  document.querySelector(`input[name="value"]:checked`);
		if(selectedValueBtn) {
			data.Number = parseInt(selectedValueBtn.value);
		}
		else {
			data.Number = null;
		}

		data.Pencil = [...document.querySelectorAll(`#clbPencil input:checked`)].map(inputEl => parseInt(inputEl.value));
	};

	const crosshairsStylesheet = new CSSStyleSheet();
	document.adoptedStyleSheets.push(crosshairsStylesheet);
	function applyCrosshairs(cell) {
		crosshairsStylesheet.replaceSync(`
			#secGame  {
				gw-cell:is([data-row="${cell.Row}"], [data-col="${cell.Col}"], [data-squ="${cell.Square}"]) {
					background-color: color-mix(in oklab, var(--selected-color), transparent 25%);

					.diamond {
						opacity: 1;
					}
				}
			}
		`);
	}
}) (window.GW.Sudoku = window.GW.Sudoku || {});