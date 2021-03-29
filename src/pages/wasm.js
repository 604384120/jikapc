import React, { lazy } from "react";
window.wasm_templates = [];

const loadWasm = async (id, _for) => {
	let { setElemId } = await import("rs-wasm");
	let d = document;
	let elem_id = _for || "wasm-" + id;
	let wasm_id = "rs-" + elem_id;
	let wasm_temp_id = "wasm-template-" + id;

	class main extends HTMLElement {
		constructor() {
			super();
			this.template = () => d.getElementById(wasm_temp_id);
			if (this.template()) {
				this.init();
			} else {
				this.interval = setInterval(() => {
					if (this.template()) {
						window.clearInterval(this.interval);
						this.init();
					}
				}, 10);
			}
		}
		init() {
			const childNodes = this.template().childNodes;
			const shadowRoot = this.attachShadow({ mode: "open" });
			childNodes.forEach(n => {
				shadowRoot.appendChild(n.cloneNode(true));
			});
			d.querySelector(elem_id).setAttribute("id", wasm_id);
			setElemId(wasm_id);
		}
	}

	let custom = window.customElements;
	!custom.get(elem_id) && custom.define(elem_id, main);
};

export default class Wasm extends React.PureComponent {
	constructor(props) {
		super(props);
		this.id = props.template;
		this._for = props.for;
	}
	render() {
		let templates = window.wasm_templates;
		if (templates.indexOf(this.id) === -1) {
			templates.push(this.id);
			let Template = lazy(async () => import(`../common/template/${this.id}`));
			return <Template id={this.id} ref={r => r && loadWasm(r.id, this._for)} />;
		} else {
			loadWasm(this.id, this._for);
			return <s />;
		}
	}
}
