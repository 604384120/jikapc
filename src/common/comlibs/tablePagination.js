import React from "react";
import { Table } from "antd";
import Method from "../method";

/*
 * 表格列表分页组件
 */
const TablePagination_init_searchParams = {
	page: 1,
	limit: 10,
	cnt_totalnum: "YES"
};
export default class TablePagination extends React.PureComponent {
	constructor(props) {
		super();
		this.$ = new Method();
		this.onChange = this.onChange.bind(this);
		this.searchParams = { ...TablePagination_init_searchParams };
		this.selectedRowObjs = {};
		let selectedRowKeys = [];
		let keyName = props.keyName;
		if (props.params && props.params.limit) {
			this.searchParams.limit = props.params.limit;
		}
		if (props.setSelection) {
			let selection = props.setSelection;
			!Array.isArray(selection) && (selection = [selection]);
			selection.forEach(o => {
				let key = o[keyName] || o.uuid;
				if (key) {
					this.selectedRowObjs[key] = o;
					selectedRowKeys.push(key);
				}
			});
		}
		this.state = {
			loading: true,
			selectedRowKeys,
			list: []
		};
	}

	componentDidMount() {
		this.first(this.props.params);
	}

	componentDidUpdate(prevProps) {
		if (this.props.params) {
			if (JSON.stringify(this.props.params) !== JSON.stringify(prevProps.params)) {
				this.first(this.props.params);
			}
		}
	}

	async list(params = {}, change) {
		if (change) {
			this.setState({
				loading: true,
				list: []
			});
		}
		let $ = this.$;
		let keyName = this.props.keyName;
		let get = await $.get(this.api, params);
		let lists = [];
		if (!Array.isArray(get)) {
			let keys = Object.keys(get);
			let key = keys.filter(k => Array.isArray(get[k]));
			lists = get[key[0]] || [];
		} else {
			lists = get;
		}
		get.list = lists.map((obj, i) => {
			obj.key = keyName ? obj[keyName] : obj.uuid;
			obj._key = (params.page - 1) * params.limit + (i + 1);
			return obj;
		});
		this.setState({
			loading: false,
			list: get.list,
			total: get.totalnum || get.list.length
		});
	}

	onChange(e) {
		this.searchParams.page = e.current;
		this.searchParams.limit = e.pageSize;
		this.list(this.searchParams, true);
	}

	async first(params) {
		this.searchParams.page = 1;
		this.searchParams = Object.assign({}, this.searchParams, params);
		await this.list(this.searchParams);
	}

	async search(params) {
		let propsParams = this.props.params;
		this.searchParams = { ...TablePagination_init_searchParams };
		if (JSON.stringify(params) === "{}") {
			if (propsParams && propsParams.limit) {
				this.searchParams.limit = propsParams.limit;
			}
		}
		if (propsParams) {
			this.searchParams = Object.assign({}, propsParams, this.searchParams);
		}
		await this.first(params);
	}

	async reload() {
		await this.search({
			page: this.searchParams.page
		});
	}

	init() {
		this.search({});
	}

	selectRow(record) {
		const selectedRowKeys = [...this.state.selectedRowKeys];
		if (selectedRowKeys.indexOf(record.key) >= 0) {
			selectedRowKeys.splice(selectedRowKeys.indexOf(record.key), 1);
		} else {
			selectedRowKeys.push(record.key);
		}
		this.sureType = "selectRow";
		this.setState({ selectedRowKeys });
	}

	delSelection(key) {
		const selectedRowKeys = [...this.state.selectedRowKeys];
		const index = selectedRowKeys.indexOf(key);
		selectedRowKeys.splice(index, 1);
		this.setState({ selectedRowKeys });
	}

	render() {
		let {
			api,
			params = {},
			search,
			className,
			columns: _columns,
			rowSelection,
			rowType = "checkbox",
			onSelection,
			onRow,
			scroll = { x: "max-content" }
		} = this.props;
		let { list, selectedRowKeys } = this.state;
		this.api = api;

		const columns = _columns.map((cols, index) => { 
			if (index === 0) {
				cols.fixed = "left";
				cols.width = cols.width || 60;
				if (!cols.dataIndex && !cols.key) {
					cols.key = "_key";
				}
			}
			if (index === 1) {
				cols.fixed = "left";
				cols.width = cols.width || 150;
			}
			return cols;
		});

		this.$.scrollmove("ant-table-header-column", ".ant-table-body");

		this.$.store(search, params => {
			this.search(params);
		});

		let objs = {};
		let keyName = this.props.keyName;
		selectedRowKeys.forEach(s => {
			objs[s] = this.selectedRowObjs[s] || {};
			list.forEach(l => {
				let key = keyName ? l[keyName] : l.uuid;
				if (key === s) {
					objs[s] = l;
				}
			});
		});
		this.selectedRowObjs = objs;
		onSelection && onSelection(objs);

		return (
			<Table
				loading={this.state.loading}
				className={className}
				dataSource={list}
				columns={columns}
				size="middle"
				pagination={{
					hideOnSinglePage: params.cnt_totalnum === "NO",
					current: this.searchParams.page,
					defaultPageSize: this.searchParams.limit,
					size: "middle",
					total: this.state.total,
					showTotal: total => `共${total}条数据`
				}}
				onRow={
					onRow
						? record => ({
								onClick: () => this.selectRow(record)
						  })
						: null
				}
				rowSelection={
					rowSelection && {
						type: rowType,
						selectedRowKeys,
						onSelect: () => {
							this.sureType = "selectRow";
						},
						onChange: selectedRowKeys =>
							this.setState({
								selectedRowKeys
							})
					}
				}
				onChange={this.onChange}
				scroll={scroll}
			/>
		);
	}
}
