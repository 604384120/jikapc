import React, { useState } from "react";
import { InfiniteLoader, List, AutoSizer } from "react-virtualized";
import { Skeleton, Spin } from "antd";
import Method from "../method";
import "react-virtualized/styles.css";

/*
 * 列表无限加载组件
 */
export default class unlimitedload extends React.PureComponent {
	constructor(props) {
		super();
		this.$ = new Method(props);
		this.status = false;
		this.state = {
			rowCount: 0
		};
		(async () => {
			let params = props.params || {};
			let data = await this.$.get(
				props.api,
				this.$.assign(
					{
						limit: 1,
						page: 1,
						totalnum: "YES"
					},
					params
				)
			);
			this.setState({
				rowCount: data.totalnum
			});
		})();
	}

	render() {
		let {
			api,
			params = {},
			limit = 50,
			rowHeight = 50,
			RenderList,
			RenderLoad
		} = this.props;
		let $ = this.$;
		let list = [];
		let page = 1;
		let rowCount = this.state.rowCount;
		let setLoading = () => {};

		function isRowLoaded({ index }) {
			return !!list[index];
		}

		let loadMoreRows = ({ startIndex, stopIndex }) => {
			return new Promise(async (resolve, reject) => {
				if (this.status) {
					resolve();
				} else {
					this.status = true;
					params.limit = limit;
					params.page = page;
					let data = await $.get(api, params);
					if (page === 1) {
						setLoading();
					}
					list = list.concat(data);
					page++;
					this.status = false;
					resolve();
				}
			});
		};

		function rowRenderer({ key, index, style }) {
			let Render = <i />;
			let data = list[index];
			if (data) {
				Render = (
					<RenderList data={data} index={index} rowCount={rowCount} />
				);
			}
			if (!data && page > 1) {
				Render = <RenderLoad index={index} />;
			}
			return (
				<div key={key} style={style}>
					{Render}
				</div>
			);
		}

		let Loading = () => {
			let [first, setFirst] = useState(true);
			setLoading = () => {
				setFirst(false);
			};
			return (
				<Spin
					style={{ position: "absolute", left: "50%", top: "50%" }}
					spinning={first}
				/>
			);
		};

		return (
			<Skeleton
				loading={rowCount === 0 ? true : false}
				paragraph={{ rows: 10 }}
				active
			>
				<Loading />
				<InfiniteLoader
					isRowLoaded={isRowLoaded}
					loadMoreRows={loadMoreRows}
					rowCount={rowCount}
				>
					{({ onRowsRendered, registerChild }) => (
						<AutoSizer>
							{({ height, width }) => (
								<List
									className="CUSTOM_scroll"
									height={height}
									width={width}
									onRowsRendered={onRowsRendered}
									ref={registerChild}
									rowHeight={rowHeight}
									rowCount={rowCount}
									rowRenderer={rowRenderer}
								/>
							)}
						</AutoSizer>
					)}
				</InfiniteLoader>
			</Skeleton>
		);
	}
}
