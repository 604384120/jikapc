import * as React from "react";
import { Button } from "antd";
import Method from "../methodTs";

/*
 * btnloading组件
 */

type Type = "default" | "primary" | "link" | "ghost" | "dashed" | "danger" | undefined;
type Size = "default" | "small" | "large" | undefined;
type HtmlType = "button" | "reset" | "submit" | undefined;

interface Scope {
	loading: boolean;
	setloading(l: boolean, t: number): void;
}

interface Props {
	type?: Type;
	size?: Size;
	icon?: string | undefined;
	iconfont?: string | undefined;
	disabled?: boolean;
	style?: React.CSSProperties;
	className?: string;
	htmlType?: HtmlType;
	width?: number | string;
	height?: number | string;
	onClick: <T extends Scope>(arg: T) => void;
	children?: React.ReactNode;
}

interface State {
	loading: boolean;
}

@Method
export default class btnloading extends React.PureComponent<Props, State> {
	[x: string]: any;
	static defaultProps = {
		type: "primary",
		size: "default",
		icon: undefined,
		iconfont: undefined,
		disabled: false,
		htmlType: "button",
		width: "auto",
		onClick: () => { },
		children: ""
	};

	public state = {
		loading: false
	};

	get loading(): boolean {
		return this.state.loading;
	}

	set loading(loading: boolean) {
		this.setState({
			loading
		});
	}

	public setloading(loading: boolean, time: number) {
		if (time) {
			setTimeout(() => {
				this.loading = loading;
			}, time);
		} else {
			this.loading = loading;
		}
	}

	public render() {
		let {
			type,
			size,
			icon,
			iconfont,
			disabled,
			style,
			className,
			htmlType,
			width,
			height,
			onClick,
			children
		} = this.props;
		const $ = this.$;
		const Iconfont = $.icon();
		let Icon;
		let { loading } = this.state;

		if (iconfont) {
			icon = undefined;
			Icon = <Iconfont type={`icon-${iconfont}`} />
		}

		if (!icon && !Icon && !children) {
			children = "确定";
		}

		return (
			<Button
				type={type}
				size={size}
				className={className}
				htmlType={htmlType}
				icon={icon}
				loading={loading}
				onClick={() => onClick(this)}
				style={{
					padding: "0 14px",
					width,
					height,
					...style
				}}
				disabled={disabled}
			>
				{Icon}{children && <span className={`${(Icon || icon) ? "ml_10" : ""}`}>{children}</span>}
			</Button>
		);
	}
}
