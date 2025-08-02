/**
 * @file Sudoku scripts
 * @author Vera Konigin vera@groundedwren.com
 */
 
window.GW = window.GW || {};
(function Sudoku(ns) {
	ns.Data;

	ns.onNewGame = (event) => {
		event.preventDefault();

		const numHints = document.getElementById("numHints").value;
		localStorage.setItem("num-hints", numHints);

		ns.generateGameData(numHints, document.getElementById("cbxGenHardMode").checked);
		ns.renderGame();
	};
	ns.generateGameData = function generateGameData() {
		ns.Data = [];
		for(let i = 0; i < 9; i++) {
			ns.Data[i] = [];
			for(let j = 0; j < 9; j++) {
				ns.Data[i][j] = { Number: null, Locked: false, Pencil: [], Invalid: false };
			}
		}

		const gameArray = ns.Generator.generateGame(parseInt(localStorage.getItem("num-hints")));
		gameArray.forEach(gameCell => {
			if(gameCell.Value) {
				const cellObj = ns.Data[gameCell.Row - 1][gameCell.Col - 1];
				cellObj.Number = gameCell.Value;
				cellObj.Locked = true;
			}
		});
	}

	ns.renderGame = function renderGame() {
		Last.Data = [];
		localStorage.removeItem("data");

		ns.CellEl.ActionBatcher.addListener("onRender", onRender);

		const secGame = document.getElementById("secGame");
		secGame.innerHTML = `${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(squareIdx => 
			`<table role="grid" aria-labelledby="spnSquareLbl-${squareIdx + 1}">
				<tbody>${[0, 1, 2].map(rowIdx =>
					`<tr>${[0, 1, 2].map(colIdx => 
						`<td
							aria-selected=${!squareIdx && !rowIdx && !colIdx ? "true" : "false"}
							tabindex=${!squareIdx && !rowIdx && !colIdx ? "0" : "-1"}
							class="sudoku"
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

	const Last = new Proxy({Data: []}, {
		set(_target, property, value, _receiver) {
			switch(property) {
				case "Data":
					const btnUndo = document.getElementById("btnUndo");
					if(value && value.length) {
						btnUndo.removeAttribute("disabled");
					}
					else {
						btnUndo.setAttribute("disabled", "true");
					}
					break;
			}
			return Reflect.set(...arguments);
		}
	});

	ns.undo = () => {
		if(!Last.Data || !Last.Data.length) {
			return;
		}

		ns.Data = Last.Data;

		const activeCell = document.getElementById("secGame").querySelector(`td[aria-selected="true"] gw-cell`);
		ns.CellEl.ActionBatcher.addListener("afterUndo", () => {
			document.querySelector(
				`#secGame td:has([data-squ="${activeCell.Square}"][data-row="${activeCell.Row}"][data-col="${activeCell.Col}"])`
			).focus();
			GW.Controls.Toaster.showToast("Action undone", {invisible: true});
			ns.CellEl.ActionBatcher.removeListener("afterUndo");
		});
		ns.renderGame();
	};

	const onRender = () => {
		const numberCounts = ns.Data.reduce((accu, rowAry) => {
			accu = rowAry.reduce((accu, cellObj) => {
				if(cellObj.Number !== null) {
					accu[cellObj.Number] = accu[cellObj.Number] + 1;
				}
				return accu;
			}, accu);
			return accu;
		}, {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0});

		document.getElementById("olNumbers").innerHTML = Object.values(numberCounts).reduce((accu, count) => {
			accu += `<li><figure>
						<span>${count}&nbsp;/&nbsp;9</span>
						${count === 9 ? `<gw-icon iconKey="check" name="Valid"></gw-icon>` : ""}
						${count > 9 ? `<gw-icon iconKey="xmark" name="Invalid"></gw-icon>` : ""}
					</figure></li>`;
			return accu;
		}, "");

		if(ns.AutoValidate) {
			doAutoValidate();
		}
		else {
			Last.Data = JSON.parse(localStorage.getItem("data"));
			localStorage.setItem("data", JSON.stringify(ns.Data));
		}
	};

	function doAutoValidate() {
		ns.AutoValidate = false;
		const {isValid, isComplete} = checkUIValidity();
		ns.CellEl.ActionBatcher.run("AutoValidate", async () => {
			await ns.CellEl.ActionBatcher.BatchPromise;
			ns.AutoValidate = true
		});

		if(isValid && isComplete) {
			GW.Controls.Toaster.showToast(`Puzzle is valid 👍 and complete 🥳`);
		}
		if(!isValid) {
			GW.Controls.Toaster.showToast("Invalid cells detected 😖");
		}
	}

	ns.onGameFocusin = () => {
		document.getElementById("asiGame").style["visibility"] = "visible";

		if(tdWaitingForPointer) {
			return;
		}
		const secGame = document.getElementById("secGame");

		const prevCell = secGame.querySelector(`td[aria-selected="true"]`);
		prevCell?.setAttribute("aria-selected", "false");
		prevCell?.setAttribute("tabindex", "-1");
		prevCell?.classList.remove("moused");

		const focusedCell = secGame.querySelector(`td:focus`) || prevCell;
		focusedCell.setAttribute("aria-selected", "true");
		focusedCell.setAttribute("tabindex", "0");
		rebindCell(focusedCell);
	};

	let tdWaitingForPointer = null;
	ns.onGameMousedown = (event) => {
		tdWaitingForPointer = getParentSudokuTd(event.target);
		event.preventDefault();
	};
	ns.onDocMouseup = (event) => {
		const thisTd = getParentSudokuTd(event.target);
		if(thisTd && thisTd === tdWaitingForPointer) {
			tdWaitingForPointer = null;
			thisTd.focus();
			ns.onGameFocusin();
			thisTd.classList.add("moused");
		}
		else if (thisTd) {
			tdWaitingForPointer = null;
			document.querySelector(`td.sudoku[aria-selected="true"]`).focus();
		}
		else {
			tdWaitingForPointer = null;
		}
	};
	function getParentSudokuTd(elem) {
		let tdEl = elem;
		while(tdEl && tdEl.tagName !== "TD" && !tdEl.classList.contains("sudoku")) {
			tdEl = tdEl.parentElement;
		}
		return tdEl;
	}

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
		ns.applyCrosshairs();

		cellData = formBoundCell.getData();

		document.getElementById("hCell").innerText = `Cell ${formBoundCell.Coords}`;
		document.getElementById("pPosition").innerHTML = 
			`<em>Row ${formBoundCell.Row + 1} Column ${formBoundCell.Col + 1}</em>`;

		const olbValue = document.getElementById("olbValue");
		olbValue.querySelector(`fieldset`).innerHTML = `
			${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number =>
				`<label>
					<input type="radio" name="value" value="${number}" ${ number === cellData.Number ? "checked" : ""}>
					${number}
				</label>`
			).join("\n")}
		`;

		const clbPencil = document.getElementById("clbPencil");
		clbPencil.querySelector(`fieldset`).innerHTML = `
			${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number =>
				`<label>
					<input type="checkbox" value="${number}" ${ cellData.Pencil.includes(number) ? "checked" : ""}>
					${number}
				</label>`
			).join("\n")}
		`;

		document.getElementById("tdRow").innerText = [...document.querySelectorAll(
			`gw-cell[data-row="${formBoundCell.Row}"]`
		)].map(cellEl => cellEl.getData().Number).filter(number => !!number).join(", ");

		document.getElementById("tdCol").innerText = [...document.querySelectorAll(
			`gw-cell[data-col="${formBoundCell.Col}"]`
		)].map(cellEl => cellEl.getData().Number).filter(number => !!number).join(", ");

		document.getElementById("tdSquare").innerText = [...document.querySelectorAll(
			`gw-cell[data-squ="${formBoundCell.Square}"]`
		)].map(cellEl => cellEl.getData().Number).filter(number => !!number).join(", ");

		const spnLocked = document.getElementById("spnLocked");
		const tabMode = document.getElementById("tabMode");
		if(cellData.Locked) {
			spnLocked.classList.remove("hidden");
			tabMode.classList.add("hidden");
			olbValue.classList.add("hidden");
			clbPencil.classList.add("hidden");
		}
		else {
			spnLocked.classList.add("hidden");
			tabMode.classList.remove("hidden");
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
		document.getElementById("tabMode").selectTab(document.getElementById("btnPen"));
		ns.saveBoundCell();
	}

	ns.quickPencil = (value) => {
		if(formBoundCell.getData().Locked) {
			return;
		}

		const chkValue = document.querySelector(`#clbPencil input[value="${value}"]`);
		chkValue.click();
		document.getElementById("tabMode").selectTab(document.getElementById("btnPencil"));
		ns.saveBoundCell();
	};

	ns.saveBoundCell = () => {
		const data = formBoundCell.getData();

		data.Number = parseInt(document.getElementById("olbValue").Value) || null;
		data.Pencil = document.getElementById("clbPencil").Value.map(valStr => parseInt(valStr));

		ns.clearInvalidFlags();
	};

	const crosshairsStylesheet = new CSSStyleSheet();
	document.adoptedStyleSheets.push(crosshairsStylesheet);
	ns.applyCrosshairs = function applyCrosshairs() {
		if(!document.getElementById("cbxShowCrosshairs").checked || !formBoundCell) {
			crosshairsStylesheet.replaceSync(``);
			return
		}
		crosshairsStylesheet.replaceSync(`
			#secGame  {
				gw-cell:is([data-row="${formBoundCell.Row}"], [data-col="${formBoundCell.Col}"], [data-squ="${formBoundCell.Square}"]) {
					background-color: var(--selected-color);

					.diamond {
						opacity: 0.5;
					}
				}
			}
		`);
	}

	ns.onCheckValidity = () => {
		const {isValid, isComplete} = checkUIValidity();
		if(!isValid) {
			GW.Controls.Toaster.showToast("Invalid cells detected 😖");
			return;
		}
		GW.Controls.Toaster.showToast(`Puzzle is valid 👍 ${isComplete 
			? "and complete 🥳" 
			: "but incomplete 🤔"
		}`);
	};

	function checkUIValidity() {
		let isValid = true;
		["squ", "row", "col"].forEach(axis => {
			[0, 1, 2, 3, 4, 5, 6, 7, 8].forEach(idx => {
				const dataAry = [...document.querySelectorAll(
					`gw-cell[data-${axis}="${idx}"]`
				)].map(cellEl => cellEl.getData());
				const hadDups = detectAndMarkDuplicates(dataAry);
				isValid = isValid && !hadDups;
			});
		});
		let isComplete = [...document.querySelectorAll(`gw-cell [data-number="null"]`)].length === 0;

		return {isValid, isComplete};
	}
	function detectAndMarkDuplicates(dataAry) {
		const dataBuckets = dataAry.reduce((buckets, cellData) => {
			if(cellData.Number !== null) {
				buckets[cellData.Number] = buckets[cellData.Number] || [];
				buckets[cellData.Number].push(cellData);
			}
			return buckets;
		}, {});
		const duplicateBuckets = Object.values(dataBuckets).filter(bucket => bucket.length > 1);
		duplicateBuckets.forEach(dupBucket => dupBucket.forEach(cellData => cellData.Invalid = true));
		return duplicateBuckets.length > 0;
	}

	ns.clearInvalidFlags = function clearInvalidFlags() {
		ns.Data.forEach(rowData => rowData.forEach(cellData => cellData.Invalid = false));
	}
}) (window.GW.Sudoku = window.GW.Sudoku || {});