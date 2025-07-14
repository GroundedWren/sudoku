/**
 * @file Sudoke square control
 * @author Vera Konigin vera@groundedwren.com
 */
 
window.GW = window.GW || {};
(function Sudoku(ns) {
	ns.CellEl = class CellEl extends HTMLElement {
		static InstanceCount = 0; // Global count of instances created
		static InstanceMap = {}; // Dynamic map of IDs to instances of the element currently attached
		static ActionBatcher = new GW.Gizmos.ActionBatcher("CellEl");

		//Element name
		static Name = "gw-cell";
		// Element CSS rules
		static Style = `${CellEl.Name} {
			cursor: pointer;

			display: grid;
			grid-template-rows: 0.45em 1fr 0.45em;
			justify-items: center;

			width: var(--cell-size);
			height: var(--cell-size);

			border-style: solid;
			border-width: 0;
			&:is([data-col="0"], [data-col="3"], [data-col="6"]) {
				border-inline-start-color: var(--border-color);
				border-inline-start-width: 3px;
			}
			&:is([data-col="1"], [data-col="4"], [data-col="7"]) {
				border-inline-start-color: var(--border-color-2);
				border-inline-start-width: 1.5px;
			}
			&:is([data-col="2"], [data-col="5"], [data-col="8"]) {
				border-inline-start-color: var(--border-color-3);
				border-inline-start-width: 1.5px;
			}
			&:is([data-col="8"]) {
				border-inline-end-color: var(--border-color);
				border-inline-end-width: 3px;
			}
			&:is([data-row="0"], [data-row="3"], [data-row="6"]) {
				border-block-start-color: var(--border-color);
				border-block-start-width: 3px;
			}
			&:is([data-row="1"], [data-row="4"], [data-row="7"]) {
				border-block-start-color: var(--border-color-4);
				border-block-start-width: 1.5px;
			}
			&:is([data-row="2"], [data-row="5"], [data-row="8"]) {
				border-block-start-color: var(--border-color-5);
				border-block-start-width: 1.5px;
			}
			&:is([data-row="8"]) {
				border-block-end-color: var(--border-color);
				border-block-end-width: 3px;
			}

			.top {
				display: flex;
				width: 100%;
				padding-inline: 1.5px;
				justify-content: space-between;

				.pencil {
					font-size: 0.6em;
				}

				gw-icon[iconKey="lock"] {
					padding-block-start: 3px;
					.gw-icon {
						width: 0.6em;
						height: 0.6em;
					}
				}
			}

			.bkg {
				display: flex;
				justify-content: center;
				align-items: center;

				aspect-ratio: 1 / 1;
				border-radius: 20px;

				height: 100%;

				&[data-number="1"] {
					background-color: var(--cell-1-bkg-color);
					color: var(--cell-1-color);
				}
				&[data-number="2"] {
					background-color: var(--cell-2-bkg-color);
					color: var(--cell-2-color);
				}
				&[data-number="3"] {
					background-color: var(--cell-3-bkg-color);
					color: var(--cell-3-color);
				}
				&[data-number="4"] {
					background-color: var(--cell-4-bkg-color);
					color: var(--cell-4-color);
				}
				&[data-number="5"] {
					background-color: var(--cell-5-bkg-color);
					color: var(--cell-5-color);
				}
				&[data-number="6"] {
					background-color: var(--cell-6-bkg-color);
					color: var(--cell-6-color);
				}
				&[data-number="7"] {
					background-color: var(--cell-7-bkg-color);
					color: var(--cell-7-color);
				}
				&[data-number="8"] {
					background-color: var(--cell-8-bkg-color);
					color: var(--cell-8-color);
				}
				&[data-number="9"] {
					background-color: var(--cell-9-bkg-color);
					color: var(--cell-9-color);
				}
			}
			.diamond {
				content: "";
				display: inline-block;
				width: 0.45em;
				height: 0.45em;
				transform: rotate(45deg);
				border: 1px solid var(--border-color);
				opacity: 0;
			}

			&:hover {
				.diamond {
					opacity: 1 !important;
				}
			}
		}
		td[aria-selected="true"] ${CellEl.Name} {
			background-color: var(--mark-color) !important;
			.diamond {
				opacity: 1 !important;
				background-color: var(--border-color);
			}
		}
		`;

		InstanceId; // Identifier for this instance of the element
		IsInitialized; // Whether the element has rendered its content

		/** Creates an instance */
		constructor() {
			super();
			if(!this.getId) {
				// We're not initialized correctly. Attempting to fix:
				Object.setPrototypeOf(this, customElements.get(CellEl.Name).prototype);
			}
			this.InstanceId = CellEl.InstanceCount++;
		}

		/** Shortcut for the root node of the element */
		get Root() {
			return this.getRootNode();
		}
		/** Looks up the <head> element (or a fascimile thereof in the shadow DOM) for the element's root */
		get Head() {
			if(this.Root.head) {
				return this.Root.head;
			}
			if(this.Root.getElementById("gw-head")) {
				return this.Root.getElementById("gw-head");
			}
			const head = document.createElement("div");
			head.setAttribute("id", "gw-head");
			this.Root.prepend(head);
			return head;
		}

		get Square() {
			return parseInt(this.getAttribute("data-squ"));
		}
		get Row() {
			return parseInt(this.getAttribute("data-row"));
		}
		get Col() {
			return parseInt(this.getAttribute("data-col"));
		}

		get Coords() {
			return `S${this.Square + 1}-R${this.Row  % 3 + 1}-C${this.Col % 3 + 1}`;
		}

		/**
		 * Generates a globally unique ID for a key unique to the custom element instance
		 * @param {String} key Unique key within the custom element
		 * @returns A globally unique ID
		 */
		getId(key) {
			return `${CellEl.Name}-${this.InstanceId}-${key}`;
		}
		/**
		 * Finds an element within the custom element created with an ID from getId
		 * @param {String} key Unique key within the custom element
		 * @returns The element associated with the key
		 */
		getRef(key) {
			return this.querySelector(`#${CSS.escape(this.getId(key))}`);
		}

		/** Handler invoked when the element is attached to the page */
		connectedCallback() {
			this.onAttached();
		}
		/** Handler invoked when the element is moved to a new document via adoptNode() */
		adoptedCallback() {
			this.onAttached();
		}
		/** Handler invoked when the element is disconnected from the document */
		disconnectedCallback() {
			delete CellEl.InstanceMap[this.InstanceId];
		}

		/** Performs setup when the element has been sited */
		onAttached() {
			if(!this.Root.querySelector(`style.${CellEl.Name}`)) {
				this.Head.insertAdjacentHTML(
					"beforeend",
					`<style class=${CellEl.Name}>${CellEl.Style}</style>`
				);
			}

			CellEl.InstanceMap[this.InstanceId] = this;
			if(!this.IsInitialized) {
				if(document.readyState === "loading") {
					document.addEventListener("DOMContentLoaded", () => {
						if(!this.IsInitialized) {
							this.initialize();
							this.renderContent();
						}
					});
				}
				else {
					this.initialize();
					this.renderContent();
				}
			}
		}

		/** First-time setup */
		initialize() {
			this.setUpDataProxy();
			this.IsInitialized = true;
		}

		/**
		 * Fetches this cell's data
		 */
		getData() {
			return ns.Data[this.Row][this.Col];
		}

		/**
		 * Sets up a listener for our data
		 */
		setUpDataProxy() {
			ns.Data[this.Row][this.Col] = new Proxy(ns.Data[this.Row][this.Col], {
				set(_target, _property, _value, _receiver) {
					const returnVal = Reflect.set(...arguments);
					this.Cell.renderContent();
					return returnVal;
				},
				Cell: this,
			});
		}

		/** Invoked when the element is ready to render */
		renderContent() {
			CellEl.ActionBatcher.run(`cell-${this.InstanceId}`, this.#doRender)
		}

		#doRender = () => {
			const data = this.getData();
			this.innerHTML = `
				<div class="top">${data.Locked
					? `<gw-icon iconKey="lock" title="Locked"></gw-icon>`
					: `<div class="pencil">
						${data.Pencil.length ? `<span class="sr-only">Pencil selections</span>` : ""}
						${data.Pencil.join(", ")}</div>`}
					${data.Invalid ? `<gw-icon iconKey="xmark" title="Invalid"></gw-icon>` : ""}
				</div>
				<div data-number="${data.Number}" class="bkg">
					<span class="sr-only">Value</span>
					<div class="num">${data.Number || `<span class="sr-only">None</span>`}</div>
				</div>
				<div class="diamond"></div>
			`;
		};
	}
	if(!customElements.get(ns.CellEl.Name)) {
		customElements.define(ns.CellEl.Name, ns.CellEl);
	}
}) (window.GW.Sudoku = window.GW.Sudoku || {});