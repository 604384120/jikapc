import React from "react";
import { Drawer } from "antd";

/*
 * 顶部窗口组件
 */
export default class DrawerTop extends React.PureComponent {
	constructor() {
		super();
		this.status = this.status.bind(this);
		this.openDrawer = this.openDrawer.bind(this);
		this.claseDrawer = this.claseDrawer.bind(this);
		this.state = {
			title: "请填写",
			showDrawer: false,
			render: false
		};
	}

	status(obj) {
		this.setState({
			title: obj.title || "请稍等...",
			showDrawer: obj.show
		});
	}

	claseDrawer() {
		this.setState({
			title: "请稍等...",
			showDrawer: false,
			render: false
		});
	}

	openDrawer() {
		let props = this.props;
		let index = this.index;
		if (index) {
			props.store(index, obj => {
				if (obj.show === false) {
					this.claseDrawer();
				} else {
					this.setState({
						title: obj.title,
						showDrawer: true,
						render: true
					});
				}
			});
		}
	}

	render() {
		let { index, init, render: Render, bodyStyle } = this.props;

		this.index = index;
		init && init(this);
		this.openDrawer();

		return (
			<Drawer
				bodyStyle={bodyStyle}
				title={this.state.title}
				placement="top"
				visible={this.state.showDrawer}
				onClose={this.claseDrawer}
				afterVisibleChange={res => {
					if (res) {
						this.setState({
							render: true
						});
					}
				}}
			>
				<div style={{ maxHeight: window.innerHeight - 105 }}>
					<div
						style={{
							height: "min-content"
						}}
					>
						{this.state.render && <Render />}
					</div>
				</div>
			</Drawer>
		);
	}
}
