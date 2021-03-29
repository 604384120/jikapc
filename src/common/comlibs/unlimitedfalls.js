import React from "react";
import $$ from "jquery";
import {
	Masonry,
	AutoSizer,
	CellMeasurer,
	CellMeasurerCache,
	createMasonryCellPositioner
} from "react-virtualized";
import ImageMeasurer from "react-virtualized-image-measurer";
import { CSSTransition } from "react-transition-group";
import { Skeleton, message } from "antd";
import Method from "../method";

/*
 * 瀑布流无限加载组件
 */
export default class unlimitedfalls extends React.PureComponent {
	constructor(props) {
		super(props);
		this.$ = new Method();
		this._status = true;
		this._limit = 100;
		this._itemsWithSizes = [];
		this._columnCount = 0;
		this._renderIndex = 0;
		this._cellRangeMin = -1;
		this._cellRangeMax = 0;
		this._imageKey = props.imageKey || "img";
		this._cache = new CellMeasurerCache({
			defaultHeight: 250,
			defaultWidth: props.width || 200,
			fixedWidth: true
		});
		this.state = {
			list: [],
			over: false,
			columnWidth: props.width || 200,
			height: 250,
			gutterSize: props.gutter || 0,
			overscanByPixels: 1000,
			scroller: props.scroller
		};

		let vacancy = [];
		if (props.vacancy) {
			vacancy = [
				{
					vacancy: true,
					uuid: "uuid_vacancy",
					[this._imageKey]: "https://sxzimgs.oss-cn-shanghai.aliyuncs.com/sxzlogo/avatar.png"
				}
			];
		}

		this._cellRenderer = this._cellRenderer.bind(this);
		this._onResize = this._onResize.bind(this);
		this._renderAutoSizer = this._renderAutoSizer.bind(this);
		this._renderMasonry = this._renderMasonry.bind(this);
		this._setMasonryRef = this._setMasonryRef.bind(this);
		this._loadMore = this._loadMore.bind(this);

		this._init = async (param = {}, cb, status) => {
			let params = this.$.assign(props.params, param) || {};
			let data = await this.$.get(
				props.api,
				this.$.assign(
					{
						limit: props.limit || this._limit,
						page: 1,
						totalnum: "YES"
					},
					params
				)
			);
			this.state.page = 2;
			this.setState({
				list: data.data ? vacancy.concat(data.data) : vacancy
			});
			this._status = false;
			status !== false && props.init && props.init(data);
			cb && cb();
		};
		this._init();
	}

	async _loadMore() {
		let $ = this.$;
		let { list, page } = this.state;
		let { api, params = {}, limit = this._limit } = this.props;
		let threshold = list.length - this._renderIndex > limit;
		if (!this._status && !threshold) {
			this._status = true;
			params.limit = limit;
			params.page = page;
			let data = await $.get(api, params);
			if (data.length > 0) {
				this.state.list = list.concat(data);
				this.state.page++;
				this._status = false;
			} else {
				this.state.over = true;
			}
		}
	}

	_calculateColumnCount() {
		const { columnWidth, gutterSize } = this.state;

		this._columnCount = Math.floor(this._width / (columnWidth + gutterSize));
	}

	_initCellPositioner() {
		if (typeof this._cellPositioner === "undefined") {
			const { columnWidth, gutterSize } = this.state;

			this._cellPositioner = createMasonryCellPositioner({
				cellMeasurerCache: this._cache,
				columnCount: this._columnCount,
				columnWidth,
				spacer: gutterSize
			});
		}
	}

	reload() {
		message.loading("加载中，请稍等..", 0);
		this._init({}, () => {
			this._resetList();
			message.destroy();
		});
	}

	search(param) {
		message.loading("搜索中，请稍等..", 0);
		this._init(
			param,
			() => {
				this._resetList();
				message.destroy();
			},
			false
		);
	}

	remove(i) {
		const { list } = this.state;
		this.setState({
			list: this.$.delete(list, i)
		});
		this._resetList();
	}

	_onResize({ width }) {
		this._width = width;
		this._calculateColumnCount();
		this._resetCellPositioner();
		this._masonry && this._masonry.recomputeCellPositions();
	}

	render() {
		const { list, scroller } = this.state;
		!scroller && message.loading("加载中，请稍等..", 0);
		return (
			<Skeleton loading={list.length === 0 ? true : false} paragraph={{ rows: 10 }} active>
				{list.length > 0 &&
					this._renderAutoSizer(scroller || { height: window.innerHeight, scrollTop: 0 })}
			</Skeleton>
		);
	}

	_renderAutoSizer({ height, scrollTop }) {
		this._height = height || this._height;
		this._scrollTop = scrollTop || this._scrollTop;
		this._loadMore();
		const { list, overscanByPixels } = this.state;
		return (
			<ImageMeasurer
				items={list}
				image={item => this.$.addTimestamp(item[this._imageKey])}
				defaultHeight={250}
				defaultWidth={200}
			>
				{({ itemsWithSizes }) => {
					return (
						itemsWithSizes.length > 0 &&
						itemsWithSizes.length === list.length && (
							<AutoSizer
								disableHeight
								height={this._height}
								onResize={this._onResize}
								overscanByPixels={overscanByPixels}
								scrollTop={this._scrollTop}
							>
								{({ width }) =>
									width &&
									this._renderMasonry({
										width,
										itemsWithSizes
									})
								}
							</AutoSizer>
						)
					);
				}}
			</ImageMeasurer>
		);
	}

	_renderMasonry({ width, itemsWithSizes }) {
		this._width = width;
		this._itemsWithSizes = itemsWithSizes;
		this._calculateColumnCount();
		this._initCellPositioner();
		const { list, overscanByPixels } = this.state;
		if (!this._width) {
			return;
		}
		message.destroy();
		return (
			<Masonry
				style={{
					outline: "none"
				}}
				autoHeight={true}
				cellCount={list.length}
				cellMeasurerCache={this._cache}
				cellPositioner={this._cellPositioner}
				cellRenderer={({ ..._props }) =>
					this._cellRenderer({
						..._props,
						itemsWithSizes: this._itemsWithSizes
					})
				}
				height={this._height}
				overscanByPixels={overscanByPixels}
				ref={this._setMasonryRef}
				scrollTop={this._scrollTop}
				width={this._width}
			/>
		);
	}

	_cellRenderer({ index, key, parent, style, itemsWithSizes }) {
		const { columnWidth } = this.state;
		const _iWS = itemsWithSizes[index];

		if (_iWS) {
			const { item, size } = _iWS;
			const height = columnWidth * (size.height / size.width) || 250;
			const { renderList: RenderList, cache } = this.props;

			if (cache !== true) {
				let src = item[this._imageKey];
				item[this._imageKey] = this.$.addTimestamp(src, true);
			}

			const props = {
				index,
				list: itemsWithSizes,
				data: item,
				height,
				width: columnWidth
			};
			this._renderIndex = index;
			if (this._cellRangeMin === -1 || index < this._cellRangeMin) {
				this._cellRangeMin = index;
			}
			if (index > this._cellRangeMax) {
				this._cellRangeMax = index;
			}
			return (
				<CSSTransition
					key={key}
					in={true}
					timeout={800}
					classNames={"fade"}
					unmountOnExit={true}
					appear={true}
				>
					<CellMeasurer cache={this._cache} index={index} key={key} parent={parent}>
						<div
							className={`_CellMeasurers _CellMeasurer_${index}`}
							style={{
								...style,
								display: "flex"
							}}
						>
							<RenderList {...props} />
						</div>
					</CellMeasurer>
				</CSSTransition>
			);
		}
	}

	_resetList = () => {
		this._cache.clearAll();
		this._resetCellPositioner();
		this._masonry && this._masonry.clearCellPositions();
	};

	_resetCellPositioner() {
		const { columnWidth, gutterSize } = this.state;

		this._cellPositioner &&
			this._cellPositioner.reset({
				columnCount: this._columnCount,
				columnWidth,
				spacer: gutterSize
			});
	}

	_setMasonryRef(ref) {
		this._masonry = ref;
		if (ref && ref._scrollingContainer) {
			let container = $$(ref._scrollingContainer);
			let scrollBox = container.closest(".CUSTOM_scroll");
			let index = scrollBox.attr("index");
			if (index) {
				let [f, s, cellMaxTop, cellMinTop] = [0, 0, 0, 0];
				this.$.store(`Scroll_${index}`, e => {
					let scrollTop = e.currentTarget.scrollTop;
					this._scrollTop = scrollTop;
					let _fn = () => {
						if (this._scrollStatus) {
							return;
						}
						this._scrollStatus = true;
						this._cellRangeMin = -1;
						this._cellRangeMax = 0;
						ref._onScroll && ref._onScroll(e);
						clearTimeout(this._scrollTot);
						this._scrollTot = setTimeout(() => {
							this._scrollStatus = false;
						}, 100);
					};
					let conHeight = container.height();
					let direction = "down";
					f = scrollTop;
					if (s <= f) {
						direction = "down";
					} else {
						direction = "up";
					}
					s = f;
					let cellMin = container.find(`._CellMeasurer_${this._cellRangeMin}`);
					let cellMax = container.find(`._CellMeasurer_${this._cellRangeMax}`);
					if (cellMin.length > 0) {
						cellMinTop = cellMin[0].offsetTop;
					}
					if (cellMax.length > 0) {
						cellMaxTop = cellMax[0].offsetTop;
					}
					let rangeMin = scrollTop / e.currentTarget.scrollHeight - cellMinTop / conHeight;
					if (direction === "up" && rangeMin > 0 && rangeMin < 0.15) {
						_fn();
					}
					let rangeMax = cellMaxTop / conHeight - scrollTop / e.currentTarget.scrollHeight;
					if (direction === "down" && rangeMax < 0.25) {
						_fn();
					}
				});
			}
		}
	}
}
