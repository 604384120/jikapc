import * as React from "react";
import { Icon } from "antd";

/*
 * checks组件
 */
interface Props {
	set: <T>(o: object, cb: T) => void;
	name?: string;
	value?: string;
	checked?: boolean;
	className?: string;
}

interface State {
	checked: boolean;
}

export default class checks extends React.PureComponent<Props, State> {
	static defaultProps = {
		name: "uuid"
	};

	public state = {
		checked: false
	};

	get checked(): boolean {
		return this.state.checked;
	}

	set checked(checked: boolean) {
		this.setState({
			checked
		});
	}

	public setChecked(status: boolean) {
		this.checked = status;
	}

	render() {
		let { set, name, value, checked: isChecked, className } = this.props;
		let { checked } = this.state;
		return (
			<div
				className={`bg_white br_3 ${className}`}
				style={{
					width: "24px",
					height: "24px",
					padding: "1px",
					pointerEvents: "none"
				}}
			>
				{(isChecked || checked) && (
					<div
						style={{
							width: "22px",
							height: "22px"
						}}
						className="bg_blue br_3 ta_c"
					>
						{set({
							name,
							value
						}, () => <input type="hidden" />)}
						<Icon className="fc_white" type="check" />
					</div>
				)}
			</div>
		);
	}
}
