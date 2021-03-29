import React from "react";
import { Dropdown, Menu } from "antd";
import Method from "../method";

/*
 * dropdown组件
 */

export default class dropdown extends React.PureComponent {
	constructor(props) {
		super(props);
		this.$ = new Method(props);
	}

	render() {
		let { list = [], data = "", className = "", placement = "bottomRight", children } = this.props;
		const Iconfont = this.$.icon();

		const menu = rs => (
			<Menu>
				{list.map((item, key) => (
					<Menu.Item key={key} onClick={e => item.onClick(rs, e)}>
						{item.icon && (
							<Iconfont className="fs_14 mr_10" style={{ color: "#333" }} type={item.icon} />
						)}
						<span>{typeof item.name === "function" ? item.name(rs) : item.name}</span>
					</Menu.Item>
				))}
			</Menu>
		);

		return (
			<Dropdown
				className={className}
				overlay={() => menu(data)}
				trigger={["click"]}
				placement={placement}
			>
				{children}
			</Dropdown>
		);
	}
}
