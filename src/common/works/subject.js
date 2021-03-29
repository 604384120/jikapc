import React from "react";
import { Select, Form } from "antd";
import Method from "../method";

const { Option } = Select;

/*
 * 科目下拉选择
 */
let GET_Subject = "";
export default class Subject extends React.Component {
	constructor(props) {
		super();
		this.list = this.list.bind(this);
		this.state = {
			loading: true,
			list: []
		};
	}

	componentDidMount() {
		this.list();
	}

	async list() {
		let $ = new Method();
		if (!GET_Subject) {
			GET_Subject = await $.get("/achievement/examsubjects/list", {
				limit: 1000,
				status: "INSERVICE"
			});
		}
		this.setState({
			loading: false,
			list: Array.isArray(GET_Subject)? GET_Subject: []
		});
	}

	render() {
		const {
			form,
			label,
			name = "examsubject_uuid",
			value,
			width,
			style,
			className,
			required = false,
			disabled = false,
			multiple = false,
			labelCol: _labelCol,
			wrapperCol: _wrapperCol
		} = this.props;
		const { getFieldDecorator, labelCol, wrapperCol } = form;

		this.name = name;

		const Dom = () => {
			if (disabled) {
				let text = [];
				let list = this.state.list;
				for (let i in list) {
					if (value.indexOf(list[i].uuid) > -1) {
						text.push(list[i].name);
					}
				}
				return (
					<span>
						{text.toString()}
						<input type="hidden" />
					</span>
				);
			}
			return (
				<Select
					style={{
						width,
						...style
					}}
					placeholder="请选择科目"
					mode={multiple ? "multiple" : null}
					allowClear
					loading={this.state.loading}
				>
					{this.state.list.map((obj, key) => (
						<Option key={key} value={obj.uuid}>
							{obj.name}
						</Option>
					))}
				</Select>
			);
		};

		const formDom = getFieldDecorator(name, {
			initialValue: value,
			rules: required
				? [
						{
							required: true,
							message: "请选择好科目后再操作!"
						}
				  ]
				: []
		})(Dom());

		if (label) {
			return (
				<Form.Item
					label={label}
					labelCol={_labelCol || labelCol}
					wrapperCol={_wrapperCol || wrapperCol}
				>
					{formDom}
				</Form.Item>
			);
		} else {
			return <span className={className}>{formDom}</span>;
		}
	}
}
