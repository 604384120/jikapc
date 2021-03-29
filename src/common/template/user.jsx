import React from "react";

export default class template extends React.PureComponent {
    constructor(props) {
		super(props);
		this.id = props.id
	}
	render() {
		return (
			<template id={`wasm-template-${this.id}`}>
				<span>
					<slot name="person-name">NAME MISSING</slot>
				</span>
				<img alt="test" style={{width: 250}} src="https://semantic-ui.com/images/avatar2/large/kristy.png" className="image" />
			</template>
		);
	}
}
