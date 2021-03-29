import React from "react";
import $$ from "jquery";
import { Modal } from "antd";
import Method from "../method";

/*
 * 弹窗组件
 */
export default class Modals extends React.PureComponent {
	constructor(props) {
		super();
		this.$ = new Method(props);
		this.data = "";
		this.status = this.status.bind(this);
		this.showModal = this.showModal.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleOk = this.handleOk.bind(this);
		this.winScrollY = 0;
		this.state = {
			title: "请填写",
			visible: false,
			confirmLoading: false
		};
	}

	status(obj) {
		if (obj.show !== false) {
			this.winScrollY = window.scrollY;
		}
		this.setState({
			title: obj.title,
			visible: obj.show === false ? false : true
		});
	}

	open(title, data) {
		this.data = data;
		this.status({
			title,
			show: true
		});
	}

	close() {
		this.status({
			show: false
		});
	}

	showModal() {
		let index = this.props.index;
		if (index) {
			this.props.store(index, obj => {
				this.status(obj);
			});
		}
	}

	handleCancel() {
		let { onCancel } = this.props;
		this.setState({
			visible: false
		});
		onCancel && onCancel();
	}

	handleOk() {
		this.setState({
			confirmLoading: true
		});
		setTimeout(() => {
			this.setState({
				visible: false,
				confirmLoading: false
			});
		}, 2000);
	}

	render() {
		const { title, visible, confirmLoading } = this.state;
		let {
			children,
			width,
			zIndex,
			style = { width: 520 },
			maskClosable = true,
			closable = true
		} = this.props;

		this.showModal();

		return (
			<Modal
				title={title}
				zIndex={zIndex}
				width={width || style.width}
				visible={visible}
				onOk={this.handleOk}
				confirmLoading={confirmLoading}
				onCancel={this.handleCancel}
				maskClosable={maskClosable}
				afterClose={() =>
					$$("body,html").animate(
						{
							scrollTop: this.winScrollY
						},
						500
					)
				}
				footer={null}
				closable={closable}
			>
				{this.state.visible &&
					(typeof children === "function"
						? children(this.data)
						: children)}
			</Modal>
		);
	}
}
