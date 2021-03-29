import React from "react";
import { Spin, Icon } from "antd";
import Method from "../method";

/*
 * img组件
 */
export default class img extends React.PureComponent {
	constructor() {
		super();
		this.$ = new Method();
		this.state = {
			status: false
		};
	}

	render() {
		let $ = this.$;
		let { status } = this.state;
		let {
			onClick,
			alt = "图片",
			src,
			width = "auto",
			height = "auto",
			style,
			cache = true,
			params,
			onLoad
		} = this.props;
		const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
		params && (src += $.urlConcat(src) + $.formatParams(params));
		cache === false && (src = this.$.addTimestamp(src));
		return (
			<div
				className="box box-allc pst_rel m_auto"
				style={{
					width,
					height,
					minWidth: 24,
					minHeight: 24,
					backgroundColor: "rgba(0, 0, 0, 0.05)"
				}}
			>
				{!status && (
					<Spin
						className="pst_abs"
						style={{ top: "50%", left: "50%", margin: -12 }}
						indicator={antIcon}
					/>
				)}
				<img
					className={`${status ? "" : "lucid"} tranall`}
					alt={alt}
					width={width}
					height={height}
					src={src}
					style={style}
					onClick={onClick}
					onLoad={() => {
						this.setState({
							status: true
						});
						onLoad && onLoad(src);
					}}
				/>
			</div>
		);
	}
}
