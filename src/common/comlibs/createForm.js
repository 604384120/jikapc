import React from "react";
import { Form } from "antd";
import Method from "../method";

/*
 * Form表单组件
 */
export default class CreateForm extends React.PureComponent {
	constructor(props) {
		super();
		this.$ = new Method(props);
		this.submitForm = this.submitForm.bind(this);
	}

	submitForm(props) {
		let $ = this.$;
		let form = props.form;
		let { getFieldDecorator, setFieldsValue, isFieldTouched, getFieldValue } = form;
		let {
			style,
			className,
			valueReturn,
			layout = "horizontal",
			children,
			onSubmit,
			action,
			method = "GET",
			params = {},
			warning,
			success,
			failure
		} = this.props;
		form.labelCol = this.labelCol;
		form.wrapperCol = this.wrapperCol;
		let handleSubmit = (e, ext) => {
			e.preventDefault && e.preventDefault();
			let btn = {};
			if (e.props && e.props.htmlType === "button") {
				btn = e;
			}
			btn.loading = true;
			form.validateFieldsAndScroll(async (error, values) => {
				for (let i in values) {
					let val = values[i];
					let format = values[i + "_format"];
					if (i && val && val._isAMomentObject === true) {
						values[i] = $.dateFormat(val._d, format || val._f);
					}
					if (Array.isArray(val)) {
						values[i] = val.map(v => {
							if (v._isAMomentObject === true) {
								v = $.dateFormat(v._d, format || v._f);
							}
							return v;
						});
					}
					if (format) {
						delete values[i + "_format"];
					}
					if (val === null || val === undefined) {
						values[i] = "";
					}
				}
				if (valueReturn) {
					values = valueReturn(values);
				}
				if (!error) {
					if (onSubmit) {
						onSubmit(values, btn, ext);
						return;
					}
					let Params = Object.assign({}, values, params);
					let fail = res => {
						btn.loading = false;
						failure && failure(res);
					};
					let data = {};
					if (method === "POST" || method === "post") {
						data = await $.post(action, Params, res => fail(res));
					} else {
						data = await $.get(action, Params, res => fail(res));
					}
					btn.loading = false;
					success && success(data, { btn, values: Params });
				} else {
					btn.loading = false;
					warning
						? Object.values(error).forEach(e => e.errors.forEach(err => $.warning(err.message)))
						: $.warning("表单内还有内容未完成哦~");
				}
			});
		};

		let setByName = (name, val) => {
			if (isFieldTouched(name)) {
				setFieldsValue({ [name]: val });
			} else {
				getFieldDecorator(name, {
					initialValue: val
				});
			}
		};
		let getByName = name => {
			return getFieldValue(name);
		};
		let set = ({ name, value, required, rules }, component) => {
			//let value = () => getFieldValue(name);
			let valueSet = (val, last) => {
				if (!last) {
					setFieldsValue({ [name]: val });
				} else {
					setFieldsValue({ [last]: val });
				}
			};
			if (!rules && required) {
				rules = [
					{
						required: true,
						message: required
					}
				];
			}
			return getFieldDecorator(name, {
				rules: rules || [],
				initialValue: value
			})(component(valueSet));
		};

		let vals = form.getFieldsValue();
    Object.keys(vals).forEach(key => setByName(key, vals[key]));
    form._handleSubmit = handleSubmit;
		return (
			<Form
				style={style}
				className={className}
				layout={layout}
				onSubmit={handleSubmit}
				labelCol={this.labelCol}
				wrapperCol={this.wrapperCol}
			>
				{children({
					form,
					set,
					getByName,
					setByName,
					getDec: getFieldDecorator,
					submit: handleSubmit
				})}
			</Form>
		);
	}

	render() {
		let $ = this.$;
		let { index = $.timestamp, labelCol = {}, wrapperCol = {} } = this.props;
		this.labelCol = labelCol;
		this.wrapperCol = wrapperCol;
		let CreateForm = Form.create({ name: "Form_" + index })(this.submitForm);
		return <CreateForm />;
	}
}
