import React from "react";
import { Table, Input, InputNumber, Popconfirm, Form, Icon, Divider } from "antd";
import Method from "../method";

const EditableContext = React.createContext();

class EditableCell extends React.Component {
	getInput = msg => {
		let $ = new Method();
		let { inputType: type, min } = this.props;
		if (type === "number") {
			return <InputNumber placeholder={msg} />;
		}
		if (type === "integer") {
			return (
				<InputNumber min={min || 0} parser={v => Math.abs(parseInt(v)) || 0} placeholder={msg} />
			);
		}
		if (type === "money") {
			return (
				<InputNumber
					min={0.01}
					step={0.01}
					formatter={$.toPenny}
					parser={$.toPenny}
					placeholder={msg}
				/>
			);
		}
		return <Input placeholder={msg} />;
	};

	renderCell = ({ getFieldDecorator }) => {
		let {
			editing,
			dataIndex,
			title,
			inputType,
			required,
			record,
			index,
			children,
			...restProps
		} = this.props;
		return (
			<td {...restProps}>
				{editing ? (
					<Form.Item style={{ margin: 0 }}>
						{getFieldDecorator(dataIndex, {
							rules: [
								{
									required,
									message: `请输入${title}!`
								}
							],
							initialValue: record[dataIndex]
						})(this.getInput(`请输入${title}!`))}
					</Form.Item>
				) : (
					children
				)}
			</td>
		);
	};

	render() {
		return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
	}
}

class EditableTable extends React.Component {
	constructor(props) {
		super(props);
		this.$ = new Method();
		this.setByKey = this.setByKey.bind(this);
		let propsData = props.data || [];
		if (propsData.length === 0) {
			propsData = [{}];
		}
		let data =
			propsData.map((d, i) => ({
				...d,
				key: this.key(i)
			})) || [];
		this.state = { data, editingKey: JSON.stringify(propsData) === "[{}]" ? data[0].key : "" };

		this.columns = props.columns || [];
		this.columns.push({
			title: "操作",
			width: 100,
			dataIndex: this.$.timestamp + "-operation",
			render: (text, record) => {
				const { editingKey } = this.state;
				const editable = this.isEditing(record);
				return editable ? (
					<span>
						<EditableContext.Consumer>
							{form => <a onClick={() => this.save(form, record.key)}>确定</a>}
						</EditableContext.Consumer>
						<Divider type="vertical" />
						{/* <a onClick={() => this.cancel(record.key)}>取消</a> */}
						<Popconfirm title="确定要删除吗?" onConfirm={() => this.del(record.key)}>
							<a className="fc_err">删除</a>
						</Popconfirm>
					</span>
				) : (
					<span>
						<a disabled={editingKey !== ""} onClick={() => this.edit(record.key)}>
							编辑
						</a>
						<Divider type="vertical" />
						<Popconfirm title="确定要删除吗?" onConfirm={() => this.del(record.key)}>
							<a disabled={editingKey !== ""} className="fc_err">
								删除
							</a>
						</Popconfirm>
					</span>
				);
			}
		});
		props.init && props.init(this);
	}

	isEditing = record => record.key === this.state.editingKey;

	key = i => {
		if (typeof i === "string") {
			let data = [...this.state.data];
			return data.findIndex(item => i === item.key);
		} else {
			return this.$.realTimestamp() + "-key-" + i;
		}
	};

	cancel = () => {
		this.setState({ editingKey: "" });
	};

	del = key => {
		const $ = this.$;
		const { data } = this.state;
		const onDelete = this.props.onDelete;
		let index = this.key(key);
		onDelete && onDelete(data[index]);
		this.setState({
			editingKey: "",
			data: $.delete(data, index)
		});
	};

	setByKey(key, name, value, render) {
		let { data } = this.state;
		let index = this.key(key);
		data[index][name] = value;
		render && this.setState({ data });
	}

	getByKey(key, name) {
		let { data } = this.state;
		let index = this.key(key);
		return data[index][name];
	}

	save(form, key) {
		let { data } = this.state;
		let curData = data[this.key(key)];
		let only = curData.only || {};
		let oyKeys = Object.keys(only);
		let oyMsgs = Object.values(only);
		let required = curData.required || {};
		let rqKeys = Object.keys(required);
		let rqMsgs = Object.values(required);
		let preStatus = true;
		rqKeys.forEach((k, i) => {
			if (!curData[k]) {
				this.$.warning(rqMsgs[i]);
				preStatus = false;
			}
		});
		oyKeys.forEach((k, i) => {
			let value = curData[k];
			data.forEach(d => {
				if (value && d.key !== key && d[k] === value) {
					this.$.warning(oyMsgs[i]);
					preStatus = false;
				}
			});
		});
		if (!preStatus) return;
		form.validateFields((error, row) => {
			if (error) {
				return;
			}
			const { onSave, columns } = this.props;
			const newData = [...data];
			let index = this.key(key);
			columns.forEach(col => {
				for (let r in row) {
					if (col.dataIndex === r) {
						if (col.type === "integer" && !row[r]) {
							row[r] = col.min || 0;
						}
					}
				}
			});
			if (index > -1) {
				const item = newData[index];
				newData.splice(index, 1, {
					...item,
					...row
				});
				onSave && onSave(newData[index]);
			} else {
				newData.push(row);
				onSave && onSave(row);
			}
			this.setState({ data: newData, editingKey: "" });
		});
	}

	edit(key) {
		this.setState({ editingKey: key });
	}

	handleAdd = () => {
		const { columns } = this.props;
		const { data } = this.state;
		const i = data.length;
		let key = this.key(i);
		let newData = { key };
		columns.forEach(c => {
			c.dataIndex && (newData[c.dataIndex] = "");
		});
		this.setState({
			data: [...data, newData],
			editingKey: key
		});
	};

	render() {
		const { title, onChange } = this.props;
		const { data, editingKey } = this.state;
		const components = {
			body: {
				cell: EditableCell
			}
		};

		const columns = this.columns.map((col, i) => {
			if (!col.dataIndex) {
				col.key = this.$.timestamp + "-dataIndex-" + i;
			}
			if (!col.editable) {
				return col;
			}
			return {
				...col,
				onCell: record => ({
					record,
					inputType: col.type || "text",
					min: col.min,
					dataIndex: col.dataIndex,
					title: col.title,
					required: col.required,
					editing: this.isEditing(record)
				})
			};
		});

		let dataObj = {};
		data.forEach(d => {
			for (let o in d) {
				if (o) {
					!dataObj[o] && (dataObj[o] = []);
					dataObj[o].push(d[o]);
				}
			}
		});
		onChange && onChange(data, dataObj);

		return (
			<EditableContext.Provider value={this.props.form}>
				<Table
					components={components}
					size="middle"
					dataSource={data}
					columns={columns}
					rowClassName="editable-row"
					pagination={false}
				/>
				<a
					disabled={editingKey !== ""}
					className="dis_b bb_1 ta_c pointer"
					onClick={this.handleAdd}
					style={{
						lineHeight: "40px"
					}}
				>
					<Icon type="plus" /> 添加{title}
				</a>
			</EditableContext.Provider>
		);
	}
}

const TableEdit = Form.create()(EditableTable);

export default TableEdit;
