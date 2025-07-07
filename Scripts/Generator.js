/**
 * @file Display scripts
 * @author Vera Konigin vera@groundedwren.com
 */
 
window.GW = window.GW || {};
(function Display(ns) {
	ns.generateGame = function generateGame(numHints) {
		const cellSet = new Set();
		setup(cellSet);
		singleSolve(cellSet);

		const cellArray = shuffleArray(Array.from(cellSet));
		for(let i = (numHints-1); i < 81; i++) {
			cellArray[i].Value = null;
		}

		return cellArray;
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
					Blocks: {
						1: 0,
						2: 0,
						3: 0,
						4: 0,
						5: 0,
						6: 0,
						7: 0,
						8: 0,
						9: 0,
					},
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
				solCell.Links.forEach(linkCell => {
					linkCell.Blocks[solCell.Value] = Math.max(0, linkCell.Blocks[solCell.Value]) - 1
				});
				solCell.Value = null;
				solCell.TryIdx += 1;
				unsolvedCells.unshift(solCell);
			}
			else {
				cell.Value = options[cell.TryIdx];
				cell.Links.forEach(linkCell => {
					linkCell.Blocks[cell.Value] = linkCell.Blocks[cell.Value] + 1;
				});
				solvedCells.unshift(cell);
			}
		}
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
}) (window.GW.Sudoku.Generator = window.GW.Sudoku.Generator || {});