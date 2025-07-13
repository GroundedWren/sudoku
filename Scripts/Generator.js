/**
 * @file Display scripts
 * @author Vera Konigin vera@groundedwren.com
 */
 
window.GW = window.GW || {};
(function Display(ns) {
	ns.generateGame = function generateGame(numHints, doHardMode) {
		const cellSet = new Set();
		setup(cellSet);
		singleSolve(cellSet);
		return doHardMode ? reduceSimple(cellSet, numHints) : reduceComplex(cellSet, numHints);
	};

	function setup(cellSet) {
		const squareMap = new Map();
		const rowMap = new Map();
		const colMap = new Map();
		for(let row = 1; row <= 9; row ++) {
			for(let col = 1; col <= 9; col ++) {
				const squ = Math.floor((row-1)/3)*3 + Math.floor((col-1)/3) + 1;
				const cellObj = {
					Square: squ,
					Row: row,
					Col: col,
					Value: null,
					Choices: shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]),
					Blocks: [1, 2, 3, 4, 5, 6, 7, 8, 9].reduce((accu, val) => {
						accu[val] = 0;
						return accu;
					}, {}),
					TryIdx: 0,
					Links: new Set()
				};
				
				if(!squareMap.has(squ)) {
					squareMap.set(squ, new Set());
				}
				squareMap.get(squ).add(cellObj);

				if(!rowMap.has(row)) {
					rowMap.set(row, new Set());
				}
				rowMap.get(row).add(cellObj);

				if(!colMap.has(col)) {
					colMap.set(col, new Set());
				}
				colMap.get(col).add(cellObj);

				cellSet.add(cellObj);
			}
		}
		cellSet.forEach(cellObj => {
			squareMap.get(cellObj.Square).forEach((squareNeighborObj) => {
				if(squareNeighborObj !== cellObj) {
					cellObj.Links.add(squareNeighborObj);
				}
			});
			rowMap.get(cellObj.Row).forEach((rowNeighborObj) => {
				if(rowNeighborObj !== cellObj) {
					cellObj.Links.add(rowNeighborObj);
				}
			});
			colMap.get(cellObj.Col).forEach((colNeighborObj) => {
				if(colNeighborObj !== cellObj) {
					cellObj.Links.add(colNeighborObj);
				}
			});
		});
	}

	function singleSolve(cellSet) {
		const unsolvedCells = Array.from(cellSet);
		const solvedCells = [];

		while(unsolvedCells.length) {
			const cell = unsolvedCells.shift();
			const options = getOptions(cell);
			if(!options.length || cell.TryIdx >= options.length) {
				cell.TryIdx = 0;
				unsolvedCells.unshift(cell);
				const solCell = solvedCells.shift();
				setCellValue(solCell, null);
				solCell.TryIdx += 1;
				unsolvedCells.unshift(solCell);
			}
			else {
				setCellValue(cell, options[cell.TryIdx]);
				solvedCells.unshift(cell);
			}
		}
	}

	function reduceSimple(cellSet, numHints) {
		const cellArray = shuffleArray(Array.from(cellSet));
		for(let i = numHints; i < 81; i++) {
			cellArray[i].Value = null;
		}

		return cellArray;
	}

	function reduceComplex(cellSet, numHints) {
		const solCells = shuffleArray(Array.from(cellSet));
		solCells.forEach(cell => cell.TrueValue = cell.Value);

		const delCells = [];
		let tryIdx = 0;
		while(solCells.length > numHints) {
			if(tryIdx >= solCells.length) {
				const delCell = delCells.shift();
				setCellValue(delCell, delCell.TrueValue);
				solCells.splice(delCell.TryIdx, 0, delCell);
				tryIdx = delCell.TryIdx + 1;
			}
			else {
				const solCell = solCells.splice(tryIdx, 1)[0];
				solCell.TryIdx = tryIdx;
				setCellValue(solCell, null);
				if(isSingleSolution(cellSet)) {
					delCells.unshift(solCell);
					tryIdx = 0;
				}
				else {
					solCells.splice(tryIdx, 0, solCell);
					setCellValue(solCell, solCell.TrueValue);
					tryIdx += 1;
				}
			}
		}

		return Array.from(cellSet);
	}

	function isSingleSolution(cellSet) {
		return true; //todo
	}

	function getOptions(cellObj) {
		return cellObj.Choices.filter(option => !cellObj.Blocks[option]);
	}

	function shuffleArray(ary) {
		const valAry = ary.reduce((valAry, aryItm) => {
			const valObj = {
				Value: Math.random(),
				Item: aryItm
			};
			valAry.push(valObj);
			return valAry;
		}, []);
		valAry.sort((a, b) => a.Value - b.Value);
		return valAry.map(valObj => valObj.Item);
	}

	function setCellValue(cell, value) {
		const oldValue = cell.Value;
		cell.Value = value;
		cell.Links.forEach(linkCell => {
			linkCell.Blocks[oldValue ?? value] = (value === null)
				? Math.max(0, linkCell.Blocks[oldValue]) - 1
				: linkCell.Blocks[value] + 1;
		});
	}
}) (window.GW.Sudoku.Generator = window.GW.Sudoku.Generator || {});