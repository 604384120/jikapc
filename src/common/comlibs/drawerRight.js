import React from "react";
import $$ from "jquery";
import { Drawer, Skeleton, Spin, Icon } from "antd";
import Method from "../method";

/*
 * 右侧窗口组件
 */
let DrawerRightItem = {};
export default class DrawerRight extends React.PureComponent {
	constructor(props) {
		super();
		this.$ = new Method();
		this.data = "";
		this.closeData = undefined;
		this.openDrawer = this.openDrawer.bind(this);
		this.close = this.close.bind(this);
		this.claseDrawer = this.claseDrawer.bind(this);
		this.state = {
			title: this.$.realTimestamp(),
			showDrawer: false,
			render: false,
		};
	}

	status(e, obj) {
		let $ = this.$;
		let { full } = this.props;
		let index = this.index;
		if (obj.show === false) {
			this.claseDrawer();
		} else {
			let width = $.drawerWidth(e);
			if (e) {
				e.width && (width = e.width);
				e.left && (width = $.drawerWidth(false) - e.left);
			}
			let DRightItem = DrawerRightItem[index] || {};
			if (!DRightItem.move || !DRightItem.width) {
				DRightItem.width = width;
			}
			$$("body").addClass("oy_h");
			this.setState({
				width: full ? $.drawerWidth() : DRightItem.width,
				title: obj.title || this.$.realTimestamp(),
				showDrawer: true,
			});
		}
	}

	claseDrawer() {
		this.setState({
			//title: this.$.realTimestamp(),
			showDrawer: false,
			render: false,
		});
		this.props.closed && this.props.closed();
	}

	openDrawer() {
		let index = this.index;
		this.$.store(index, (e, obj) => {
			this.status(e, obj);
		});
	}

	open(title, data, ele) {
		if (!title) {
			console.error("Page title not set [Page.open('title...')]");
			return;
		}
		this.data = data;
		this.status(ele || false, {
			show: true,
			title: title || this.$.realTimestamp(),
		});
		$$(".mainTitleBar_back").removeClass("w_0");
		$$(".mainTitleBar_text").text(title);
	}

	close(data) {
		this.closeData = data;
		this.$.store().Page_close();
	}

	setCloseData(data) {
		this.closeData = data;
	}

	render() {
		let $ = this.$;
		let {
			index = `CUSTOM_drawer_${$.timestamp}`,
			full,
			renderFooter: RenderFooter,
			bodyStyle,
			background = "#f0f2f5",
			resize = false,
			mask=true,
			onClose,
			children,
		} = this.props;
		let { render } = this.state;

		let isChildrenfn = typeof children === "function";

		if (!DrawerRightItem[index]) {
			DrawerRightItem[index] = {};
		}
		let DRightItem = DrawerRightItem[index];
		this.index = index;
		this.openDrawer();

		let Children = React.Children.map(children, (c) => {
			return React.cloneElement(c, { Parent: this });
		});

		return (
			<Drawer
				className={`CUSTOM_detailslayer ${full ? "CUSTOM_detailslayer_full" : ""}`}
				bodyStyle={bodyStyle}
				title={this.state.title}
				width={this.state.width || DRightItem.width}
				mask={mask}
				visible={this.state.showDrawer}
				onClose={this.claseDrawer}
				afterVisibleChange={(res) => {
					if (res) {
						resize &&
							this.$.drawerMove("class_drawerMoveBar", ".ant-drawer-content-wrapper", (w, i) => {
								let DRightItem = DrawerRightItem[i];
								DRightItem.move = true;
								DRightItem.width = w;
							});
						this.setState({
							render: true,
						});
						$$(window).resize(function () {
							// $$(
							// 	".CUSTOM_detailslayer:not(.CUSTOM_detailslayer_full) .ant-drawer-content-wrapper,._on_drawerWidth"
							// ).css("width", $.drawerWidth(false));
							$$(".CUSTOM_detailslayer_full .ant-drawer-content-wrapper").css({
								//width: $.drawerWidth(),
								height: $.drawerHeight(),
							});
						});
						$$(`.Scroll_${index}`).scroll((event) => {
							let onScroll = this.$.store()[`Scroll_${index}`];
							onScroll && onScroll(event);
						});
					} else {
						this.data = "";
						let layout = $$(".CUSTOM_detailslayer.ant-drawer-open");
						if (layout.length === 0 || !layout.length) {
							$$("body").removeClass("oy_h").css("overflow-y", "auto");
						}
						typeof this.closeData !== "undefined" && onClose && onClose(this.closeData);
						this.closeData = undefined;
					}
				}}
			>
				<div className="box" style={{ height: "100%", background }}>
					<div
						className="box class_drawerMoveBar"
						index={index}
						style={{
							width: "24px",
							cursor: resize ? "col-resize" : "initial",
						}}
					/>
					<div className="box box-1">
						<div
							className={`CUSTOM_scroll Scroll_${index}`}
							index={index}
							style={{
								width: "100%",
								overflowY: "auto",
								paddingTop: "32px",
								marginBottom: RenderFooter ? "108px" : "56px",
							}}
						>
							{full ? (
								render ? (
									isChildrenfn ? (
										children(this.data)
									) : (
										Children
									)
								) : (
									<Spin
										className="pst_abs"
										style={{ top: "50%", left: "50%", margin: -12 }}
										indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
									/>
								)
							) : (
								<Skeleton loading={!render ? true : false} paragraph={{ rows: 10 }} active>
									{render && (isChildrenfn ? children(this.data) : Children)}
								</Skeleton>
							)}
						</div>
					</div>
				</div>
				{RenderFooter && render && (
					<div
						style={{
							position: "absolute",
							left: 0,
							bottom: 0,
							width: "100%",
							borderTop: "1px solid #e9e9e9",
							padding: "10px 16px",
							background: "#fff",
							textAlign: "right",
							zIndex: 999,
						}}
					>
						<RenderFooter />
					</div>
				)}
			</Drawer>
		);
	}
}