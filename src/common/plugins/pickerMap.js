import React from "react";
import { Modal, Button } from "antd";

export default class picker extends React.Component {
	constructor(props) {
		super();
		this.state = {
			visible: false
		};
	}

	componentDidMount() {
		window.addEventListener(
			"message",
			e => {
				if (e.data) {
					this.onOk(e);
					this.onCancel();
					this.setState({
						value: e.data.address
					});
				}
			},
			false
		);
	}

	onCancel() {
		this.setState({
			visible: false
		});
	}

	render() {
		let { value, center = "", onOk, placeholder } = this.props;
		this.onOk = onOk;
		let url =
			"https://m.amap.com/picker/?keywords=学校,机构,教育&zoom=15&center=" +
			center +
			"&radius=1000&total=20&key=d3f5d8b3b05231fa6a11375492310e3a&platform=mobile";
		return (
			<span>
				<span className="pr_10">
					{this.state.value || value[0] || placeholder}
				</span>
				<Button
					type="primary"
					icon="search"
					size="small"
					onClick={() => {
						this.setState({
							visible: true
						});
					}}
				>
					搜索并设置
				</Button>
				<Modal
					visible={this.state.visible}
					title="位置设置"
					footer={null}
					className="PLUGINS_pickerMap"
					width={460}
					onCancel={() => this.onCancel()}
				>
					<iframe
						id="__siteSel"
						title="pickerMap"
						style={{
							border: "none",
							width: "460px",
							height: "500px"
						}}
						src={url}
						onLoad={e => {
							e.target.contentWindow.postMessage(
								"hello",
								"https://m.amap.com/picker/"
							);
						}}
					/>
				</Modal>
			</span>
		);
	}
}
