import React from "react";
import Moment from "moment";
import { Form as Forms, Input, Select, Radio, DatePicker, Button, Icon } from "antd";
import Method from "../method";
import Editor from "../plugins/editor";
import PickerMap from "../plugins/pickerMap";

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker,MonthPicker } = DatePicker;

/*
 * 表单输入框
 */
export default class Inputs extends React.PureComponent {
	constructor() {
		super();
		this.$ = new Method();
		this.save = this.save.bind(this);
		this.state = {
			loading: true,
			// suffix: "",
			list: []
		};
	}

	async save(e) {
		let props = this.props;
		let targetval = e.target.value || "";
		let { onChange, onSure, save, name, value, required, store } = props;
		let valuePro = typeof this.valuePro === "undefined" ? value || "" : this.valuePro;
		onChange && onChange(targetval);
		onSure && onSure(targetval);
		if (valuePro === targetval) {
			return false;
		}
		if (save) {
			let $ = this.$;
			if (required && !targetval) {
				$.warning(this.placeholder);
				return false;
			}
			$.loading();
			this.setState({
				suffix: <Icon type="loading" />
			});
			let end = () =>
				this.setState({
					suffix: ""
				});
			await $[save.method || "post"](
				save.api,
				Object.assign({}, this.paramsReturn(name, targetval), save.params || {}),
				() => end()
			);
			this.valuePro = targetval;
			end();
			let Reload = store().Reload;
			Reload && Reload();
			$.msg("已保存");
		}
	}

	render() {
		let {
			form,
			save,
			name,
			type,
			value,
			required = false,
			placeholder = "",
			maxLength = '',
			rows,
			radios,
			select,
			label,
			item,
      prefix,
      suffix,
			className,
			style,
			width,
			itemStyle = {},
			disabled = false,
			onChange,
			labelCol: _labelCol,
      wrapperCol: _wrapperCol,
      autoSubmit,
		} = this.props;
		const { getFieldDecorator, labelCol, wrapperCol } = form;
		if (!placeholder && label) {
			placeholder = `请输入${label}`;
		}

		if (rows) {
			type = "textArea";
		}
		if (radios) {
			type = "radio";
		}
		if (select) {
			type = "select";
		}
		if (type === "monthPicker") {
			placeholder = placeholder || "请设置日期";
			value && (value = Moment(value, "YYYY-MM"));
			getFieldDecorator(name + "_format", {
				initialValue: "YYYY-MM"
			});
		}
		if (type === "datePicker") {
			placeholder = placeholder || "请设置日期";
			value && (value = Moment(value, "YYYY-MM-DD"));
			getFieldDecorator(name + "_format", {
				initialValue: "YYYY-MM-DD"
			});
		}
		if (type === "dateTimePicker") {
			placeholder = placeholder || "请设置日期时间";
			value && (value = Moment(value, "YYYY-MM-DD HH:mm:ss"));
			getFieldDecorator(name + "_format", {
				initialValue: "YYYY-MM-DD HH:mm:ss"
			});
		}
		if (type === "rangePicker" && value) {
			value = [Moment(value[0], "YYYY-MM-DD"), Moment(value[1], "YYYY-MM-DD")];
		}
		if (type === "rangeTimePicker") {
			value &&
				(value = [
					Moment(value[0], "YYYY-MM-DD HH:mm:ss"),
					Moment(value[1], "YYYY-MM-DD HH:mm:ss")
				]);
			getFieldDecorator(name + "_format", {
				initialValue: "YYYY-MM-DD HH:mm:ss"
			});
		}

		this.type = type;
		this.placeholder = placeholder;
		this.paramsReturn = (name, value) => {
			if (Array.isArray(name)) {
				let params = {};
				name.map((n, key) => {
					params[n] = value[key];
					return n;
				});
				return params;
			}
			return {
				[name]: value
			};
		};
		let inputDom = () => {
			switch (type) {
				case "radio":
					if (disabled) {
						let text = "";
						for (let i in radios) {
							if (radios[i].value === value) {
								text = radios[i].text;
							}
						}
						return (
							<span>
								{text}
								<input type="hidden" />
							</span>
						);
					}
					return (
						<Radio.Group onChange={this.save.bind(this)}>
							{radios.map((v, k) => (
								<Radio style={style} key={k} value={v.value}>
									{v.text}
								</Radio>
							))}
						</Radio.Group>
					);
				case "select":
					if (disabled) {
						let text = "";
						for (let i in select) {
							if (select[i].value === value) {
								text = select[i].text;
							}
						}
						return (
							<span>
								{text}
								<input type="hidden" />
							</span>
						);
					}
					return (
						<Select
							style={{
								width: width || 120,
								...style
							}}
							placeholder={placeholder}
							onChange={e =>{
								this.save({
									target: {
										value: e
									}
                });
                if (autoSubmit && form._handleSubmit) {
                  let _set = setTimeout(() => {
                    form._handleSubmit({});
                    clearTimeout(_set);
                  }, 50);
                }
							}}
							allowClear
						>
							{select.map((v, k) => (
								<Option key={k} value={v.value}>
									{v.text}
								</Option>
							))}
						</Select>
					);
				case "textArea":
					if (disabled) {
						return (
							<span>
								{value}
								<input type="hidden" />
							</span>
						);
					}
					return (
						<TextArea
							style={style}
							placeholder={placeholder}
							autoSize={{ minRows: rows }}
							onBlur={this.save.bind(this)}
							suffix={suffix}
						/>
					);
				case "editable":
					return (
						<span>
							<input type="hidden" />
							<div
								style={style}
								className="contentEditable"
								contentEditable={true}
								placeholder={placeholder}
								onInput={e => {
									form.setFieldsValue({
										[name]: e.target.innerHTML
									});
								}}
								onBlur={e =>
									this.save({
										target: {
											value: e.target.innerHTML
										}
									})
								}
								disabled={disabled}
							/>
						</span>
					);
				case "editor":
					return (
						<div>
							<Editor
								value={value}
								placeholder={placeholder}
								disabled={disabled}
								onChange={data => {
									form.setFieldsValue({
										[name]: data
									});
								}}
							/>
							{save && (
								<Button
									className="tb_c mt_15"
									type="primary"
									onClick={this.save.bind(this, {
										target: {
											value: form.getFieldsValue([name])[name]
										}
									})}
									icon="save"
									loading={suffix ? true : false}
									disabled={disabled}
								>
									保 存
								</Button>
							)}
						</div>
					);
				case "password":
					return <Input.Password style={style} placeholder={placeholder} disabled={disabled} maxLength={maxLength}/>;
				case "monthPicker":
					return (
					<MonthPicker
						style={style}
						format="YYYY-MM"
						placeholder={placeholder}
						suffixIcon={suffix}
						disabled={disabled}
					/>
				);
				case "datePicker":
					return (
						<DatePicker
							style={style}
							format="YYYY-MM-DD"
							placeholder={placeholder}
							suffixIcon={suffix}
							disabled={disabled}
						/>
					);
				case "dateTimePicker":
					return (
						<DatePicker
							style={style}
							format="YYYY-MM-DD HH:mm:ss"
							showTime={{
								defaultValue: Moment("00:00:00", "HH:mm:ss")
							}}
							placeholder={placeholder}
							suffixIcon={suffix}
							disabled={disabled}
						/>
					);
				case "rangePicker":
					return (
						<RangePicker
							style={{
								width: width || 230,
								...style
							}}
							placeholder={placeholder}
							suffixIcon={suffix}
							format="YYYY-MM-DD"
							onChange={(dates, dateStrings) => {
								this.RangePickerValue = dateStrings;
								onChange && onChange(dateStrings);
							}}
							onOk={this.save.bind(this, {
								target: {
									value: this.RangePickerValue
								}
							})}
							disabled={disabled}
						/>
					);
				case "rangeTimePicker":
					return (
						<RangePicker
							style={{
								width: width || 320,
								...style
							}}
							placeholder={placeholder}
							suffixIcon={suffix}
							format="YYYY-MM-DD HH:mm:ss"
							showTime={{
								defaultValue: [Moment("00:00:00", "HH:mm:ss"), Moment("23:59:59", "HH:mm:ss")]
							}}
							onChange={(dates, dateStrings) => {
								this.RangePickerValue = dateStrings;
								onChange && onChange(dateStrings);
							}}
							onOk={this.save.bind(this, {
								target: {
									value: this.RangePickerValue
								}
							})}
							disabled={disabled}
						/>
					);
				case "address":
					return (
						<PickerMap
							center={value[1]}
							placeholder={placeholder}
							disabled={disabled}
							onOk={value => {
								this.save({
									target: {
										value: [value.data.address, value.data.location]
									}
								});
							}}
						/>
					);
				default:
					if (disabled) {
						return (
							<span>
								{value}
								<input type="hidden" />
							</span>
						);
					}
					return (
						<Input
							type="text"
							style={{
								width: width || 190,
								...style
							}}
							allowClear={disabled ? false : true}
							placeholder={placeholder}
							onBlur={this.save.bind(this)}
							prefix={prefix}
              suffix={suffix}
              onChange={(dates, dateStrings) => {
								this.RangePickerValue = dateStrings;
								onChange && onChange(dateStrings);
							}}
						/>
					);
			}
		};
		const formDom = getFieldDecorator(name, {
			initialValue: value,
			rules: required
				? [
						{
							required: true,
							message: placeholder
						}
				  ]
				: []
		})(inputDom());
		if (label || item) {
			return (
				<Forms.Item
					label={label}
					labelCol={_labelCol || labelCol}
					wrapperCol={_wrapperCol || wrapperCol}
					style={itemStyle}
					className={className}
				>
					{formDom}
				</Forms.Item>
			);
		} else {
			return <span className={`Custom_CreateForm_Inputs ${className}`}>{formDom}</span>;
		}
	}
}
