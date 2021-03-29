/*
 * 公共基础类
 * 命名规则：驼峰命名
 */
import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { createBrowserHistory } from "history";
import { Layout, Menu, Icon, Skeleton, Progress, Modal } from "antd";
import $$ from "jquery";
import Method from "./method";
import Form from "./comlibs/createForm";
import Modals from "./comlibs/modals";
import Inputs from "./comlibs/inputs";
import { Btn } from "../pages/comlibs";

const $ = new Method({ checkUpdate: false });
const history = createBrowserHistory();
const GlobalIdentity = history.location.pathname.split("/")[1];
const routes = require(`../config/routes_${GlobalIdentity}`);
const Iconfont = new Method().icon();

const { SubMenu } = Menu;
const { Header, Sider } = Layout;
const Confirm = Modal.confirm;

const Single = $.getQueryString("single") === "yes";
const Sghide = Single ? "hide" : "";

/*
 * 路由按需加载
 */
export class SuspenseSwitchRoute extends React.PureComponent {
	constructor() {
		super();
		this.$ = new Method();
		this.router = Router;
		this.routeWithSubRoutes = this.routeWithSubRoutes.bind(this);
	}

	routeWithSubRoutes(props) {
		let { component, path, name, params = {} } = props;
		let $store = this.$.store();

		let ComponentContext = lazy(async () => {
			if (!$store.GlobalFetchParams) {
				await $store.SMT_getUserData();
			}
			return import(`../pages${component}`);
		});

		useEffect(() => {
			window.wasm_templates = [];
			$store.MTB_setTitleText(name);
			$store.SML_renderCurrent(path);
			$$("body").removeClass("oy_h");
		});

		return (
			<Route
				path={path}
				render={(_props) => <ComponentContext {..._props} {...params} />}
			/>
		);
	}

	render() {
		let [RouteWithSubRoutes, IndexPage, ErrorPage, $routes = []] = [
			this.routeWithSubRoutes,
		];
		let $store = this.$.store;
		$store("GlobalIdentity", GlobalIdentity);
		let routeType = (route) => {
			if (route.type === "index") {
				route.title && (document.title = route.title);
				$store("GlobalIndexPage", route.path);
				IndexPage = lazy(async () => {
					$store().MTB_setTitleText(route.name);
					$store().SML_renderCurrent(route.path);
					if (!$store().GlobalFetchParams) {
						await $store().SMT_getUserData();
					}
					return import(`../pages${route.component}`);
				});
			}
			if (route.type === "404") {
				ErrorPage = lazy(() => import(`../pages${route.component}`));
			}
		};
		routes.map((route) => {
			if (route.component) {
				$routes.push(route);
			}
			if (route.sublist.length > 0) {
				route.sublist.map((_route) => {
					_route.component && $routes.push(_route);
					routeType(_route);
					return _route;
				});
			}
			routeType(route);
			return route;
		});
		if (!IndexPage) {
			IndexPage = ErrorPage;
		}
		return (
			<Suspense fallback={<Skeleton paragraph={{ rows: 10 }} active />}>
				<Switch>
					<Route
						exact
						path={`/${GlobalIdentity}`}
						render={(props) => <IndexPage store={$store} {...props} />}
					/>
					{$routes.map((route, i) => (
						<RouteWithSubRoutes store={$store} key={i} {...route} />
					))}
					<Route render={(props) => <ErrorPage store={$store} {...props} />} />
				</Switch>
			</Suspense>
		);
	}
}

/*
 * 顶部进度条
 */
export class TopProgress extends React.PureComponent {
	constructor() {
		super();
		this.$ = new Method();
		this.setProgress = this.setProgress.bind(this);
		this.top = -13;
		this.state = {
			top: this.top,
			progressPercent: 0,
		};
	}

	setProgress() {
		this.$.store("APP_setProgress", (status) => {
			if (status) {
				clearInterval(this.setIntvProgress);
				clearTimeout(this.setIimProgress);
				this.setState({
					progressPercent: 100,
				});
				this.setIimProgress = setTimeout(() => {
					this.setState({
						progressPercent: 0,
						top: this.top - 4,
					});
				}, 500);
			} else {
				clearInterval(this.setIntvProgress);
				clearTimeout(this.setIimProgress);
				let percent = this.state.progressPercent;
				this.setState({
					progressPercent:
						percent === 0 ? parseInt(Math.random() * 20) : percent,
					top: this.top,
				});
				this.setIntvProgress = setInterval(() => {
					if (this.state.progressPercent >= 70) {
						clearInterval(this.setIntvProgress);
					} else {
						this.setState({
							progressPercent:
								this.state.progressPercent + parseInt(Math.random() * 15),
						});
					}
				}, 200);
			}
		});
	}

	render() {
		this.setProgress();
		return (
			<Progress
				className="TopProgress"
				strokeLinecap="square"
				strokeWidth={4}
				showInfo={false}
				style={{
					top: this.state.top,
				}}
				strokeColor={{
					from: "#108ee9",
					to: "#87d068",
				}}
				percent={this.state.progressPercent}
			/>
		);
	}
}

/*
 * 主界面顶部主菜单栏
 */
export class SiderMenuTop extends React.PureComponent {
	constructor(props) {
		super();
		this.$ = new Method();
		this.store = this.$.store;
		this.toggle = this.toggle.bind(this);
		this.logout = this.logout.bind(this);
		this.reset = this.reset.bind(this);
		this.getUserData = this.getUserData.bind(this);
		this.state = {
			user: {
				username: "未登录",
			},
		};
	}

	componentDidMount() {
		this.getUser();
	}

	toggle() {
		this.props.toggle();
	}

	async getUser() {
		let $ = this.$;
		let $store = this.store;
		let params = $store().GlobalFetchParams || {}; //同步活获取同步
		params.orgtype = GlobalIdentity.toUpperCase(); // 所有接口共同带的参数，这个参数是个标识，用来标识是小程序还是PC
		params.clienttype = "COMPANY"; // 集卡一家新加的
		$store("GlobalFetchParams", params);
		let user = {};
		let pathname = window.location.pathname;
		if (pathname.indexOf("adminPc/wxRedirect") === -1) {
			user = await $.get(`/user/info`, {
				oper_uuid: $.uuid(),
			});
		}
		user.username = user.user_name;
		let GlobalData = $store().GlobalData || {};
		// GlobalData.user = user.oper;
		GlobalData.user = user;
		$store("GlobalData", GlobalData);
		this.setState({
			user: user,
			// user: user.oper
		});
		return user;
		// return user.oper;
	}

	getUserData() {
		this.store("SMT_getUserData", async (callback) => {
			return await this.getUser();
		});
	}

	logout() {
		Confirm({
			title: "确定要退出当前帐号吗?",
			okText: "确定",
			cancelText: "取消",
			onOk: () => {
				return new Promise(async (resolve, reject) => {
					let $store = this.store;
					await this.$.post("/user/logout");
					$store("GlobalFetchParams", {
						orgtype: GlobalIdentity.toUpperCase(),
					});
					$store().LG_open();
					return resolve();
				});
			},
		});
	}

	reset() {
		let $ = this.$;
		let { Ref_1 } = $.useRef(1);
		const { user } = this.state;
		return (
			<span>
				<Modals ref={Ref_1}>
					{() => (
						<Form
							action="/user/reset/passwd"
							params={{ oper_uuid: $.uuid(), username: user.username }}
							method="POST"
							success={() => {
								$.msg("帐号密码重置成功！");
								$.ref(Ref_1).close();
								this.store().LG_open();
							}}
						>
							{({ form, submit }) => (
								<div>
									<div style={{ marginLeft: 110 }}>帐号：{user.username}</div>
									<div style={{ marginLeft: 110 }} className="mt_15">
										密码：
										<Inputs
											className="input_wrap"
											form={form}
											name="passwd"
											required={true}
											placeholder="请输入密码"
										/>
									</div>
									<div className="ta_c mt_15">
										<Btn onClick={submit} />
									</div>
								</div>
							)}
						</Form>
					)}
				</Modals>
				{/* <span className="link" onClick={() => $.ref(Ref_1).open("修改密码")}>
					修改密码
				</span> */}
			</span>
		);
	}

	render() {
		const props = this.props;
		const collapsed = props.collapsed;
		const { user } = this.state;
		let Reset = this.reset;
		this.getUserData();
		return (
			<Header
				className={Sghide}
				style={{
					position: "fixed",
					zIndex: 998,
					width: "100%",
					padding: 0,
				}}
			>
				<div className="box siderMenuTop">
					<div
						style={{
							width: collapsed ? 80 : 200,
						}}
					/>
					<div className="box box-ac">
						<Icon
							type={collapsed ? "menu-unfold" : "menu-fold"}
							onClick={this.toggle.bind(this)}
							style={{
								color: "#fff",
								padding: "15px",
							}}
						/>
						<div className="fc_white">
							<span className="fs_26">集卡e家</span>
						</div>
					</div>
					<div className="box-1 ta_r pr_15">
						<span className="fc_white pr_10">
							账号：{user ? user.phone : "未登录"}{" "}
						</span>
						<Reset />
						{<span className="link" onClick={() => window.location.href='/adminPc/verify'}>
              {user?.verify_material?.verify === 'YES' && '认证成功'}
              {user?.verify_material?.verify === 'NO' && user?.verify_material?.verify_type !== 'VISITER' && '认证中'}
              {user?.verify_material?.verify === 'NO' && user?.verify_material?.verify_type === 'VISITER' && '去认证'}
              {user?.verify_material?.verify === 'FAILURE' && '认证失败'}
            </span>}
						<span className="fc_blue ph_10">|</span>
						<span className="link" onClick={this.logout.bind(this)}>
							退出
						</span>
					</div>
				</div>
			</Header>
		);
	}
}

/*
 * 主界面主标题栏
 */
export class MainTitleBar extends React.PureComponent {
	constructor(props) {
		super();
		this.$ = new Method();
		this.info = this.info.bind(this);
		this.onClick = this.onClick.bind(this);
		this.setTitleText = this.setTitleText.bind(this);
		this.state = {
			name: "",
		};
	}

	onClick() {
		let layer = $$(".CUSTOM_detailslayer.ant-drawer-open");
		let len = layer.length;
		if (len === 1) {
			$$(".mainTitleBar_back").addClass("w_0");
			$$(".mainTitleBar_text").text(this.state.name);
		}
		if (len - 2 > -1) {
			let text = $$(layer[len - 2])
				.find(".ant-drawer-title")
				.text();
			$$(".mainTitleBar_text").text(text);
		}
		if (len > 0) {
			$$(layer[len - 1])
				.find(".ant-drawer-close")
				.trigger("click");
		}
	}

	//设置标题栏标题文本内容
	setTitleText() {
		this.$.store("MTB_setTitleText", (name) => {
			$$(".mainTitleBar_text").text(name);
			this.setState({
				name,
			});
		});
	}

	info() {
		let $ = this.$;
		let [info, setInfo] = useState({});
		let status = 1;
		let get = async () => {
			let info = await $.get("/releasenote/random");
			setInfo(info);
		};
		this._init = useRef({ get });
		useEffect(() => {
			this._init.current.get();
		}, [status]);
		return (
			<s>
				{info.title && (
					<span
						style={{
							float: "right",
							marginRight: $.leftWidth() + 24,
						}}
					>
						<Iconfont
							style={{
								height: "19px",
							}}
							className="fs_16 va_m"
							type="icon-tongzhi"
						/>
						<a
							className="fc_black pl_5"
							target="_blank"
							rel="noopener noreferrer"
							href={info.article_url}
						>
							{info.title}
						</a>
					</span>
				)}
			</s>
		);
	}

	render() {
		this.setTitleText();

		this.$.store("Page_close", () => {
			this.onClick();
		});

		return (
			<div
				className={`bs ${Sghide}`}
				style={{
					position: "fixed",
					height: 32,
					lineHeight: "32px",
					width: "100%",
					zIndex: 997,
					background:
						"-webkit-gradient(linear, 0 0, 0 100%, from(#fff), to(rgba(255, 255, 255, 0.8)))",
				}}
			>
				<div
					className="mainTitleBar_back pointer dis_ib w_0 ov_h va_t"
					style={{
						width: "62px",
						height: "32px",
						transition: "width 0.3s",
					}}
					onClick={this.onClick}
				>
					<Icon
						style={{
							margin: "0 5px 0 15px",
						}}
						type="arrow-left"
					/>
					<span>返回</span>
				</div>
				<span
					style={{
						color: "#1890ff",
						fontSize: "12px",
						padding: "0 5px",
					}}
				>
					丨
				</span>
				<span className="mainTitleBar_text">{this.state.name}</span>
				{/* <Info /> */}
			</div>
		);
	}
}

/*
 * 主界面左侧主菜单栏
 */
export class SiderMenuLeft extends React.PureComponent {
	constructor() {
		super();
		this.$ = new Method();
		this.renderCurrent = this.renderCurrent.bind(this);
		this.state = {
			current: "",
		};
	}

	renderCurrent(e) {
		this.setState({
			current: e.key || this.state.current,
		});
	}

	renderCurrentProps() {
		this.$.store("SML_renderCurrent", (key) => {
			this.renderCurrent({
				key: `submenuitem_${key}`,
			});
		});
	}

	render() {
		let { collapsed } = this.props;
		this.renderCurrentProps();
		let MenuItem = (_route, TopMenu) => (
			<Menu.Item
				className="ant-menu-singlemenu"
				title={_route.name}
				key={`submenuitem_${_route.path || _route.link}`}
			>
				{_route.link ? (
					<div
						className={`mlink ${TopMenu}`}
						onClick={() => {
							window.location.href = _route.link;
						}}
					>
						{_route.icon && (
							<Iconfont
								style={{
									fontSize: 18,
								}}
								type={_route.icon}
							/>
						)}
						{!collapsed || !TopMenu ? _route.name : ""}
					</div>
				) : (
					<Link
						className={TopMenu}
						style={{ color: "#fff" }}
						onClick={() => $$(".mainTitleBar_back").addClass("w_0")}
						to={_route.path}
					>
						{_route.icon && (
							<Iconfont
								style={{
									fontSize: 18,
								}}
								type={_route.icon}
							/>
						)}
						{!collapsed ? _route.name : ""}
					</Link>
				)}
			</Menu.Item>
		);
		return (
			<Sider
				trigger={null}
				collapsible
				collapsed={collapsed}
				width={200}
				className={Sghide}
				style={{
					overflow: "auto",
					height: "100vh",
					position: "fixed",
					left: 0,
					top: 0,
					zIndex: 999,
					boxShadow: "0 0 3px 1px rgb(27, 27, 27)",
				}}
			>
				<Menu
					theme="dark"
					mode="vertical"
					onClick={this.renderCurrent}
					selectedKeys={[this.state.current]}
					style={{ height: "100%", borderRight: 0 }}
				>
					<div
						style={{
							background: "#fff",
							borderRadius: 6,
							boxShadow: "0 0 0 1px #333",
							margin: "20px auto 15px auto",
							overflow: "hidden",
							height: 45,
							width: 45,
							textAlign: "center",
						}}
					>
						<img
							alt="logo"
							style={{
								width: 45,
								height: 45,
							}}
							src="https://sxzimgs.oss-cn-shanghai.aliyuncs.com/yingxiao/page/6a4b1b3e-e385-11ea-8ba7-00163e04cc20.png"
						/>
					</div>
					{routes.map((route, i) => {
						if (route.hide === true) {
							return null;
						}
						if (route.sublist.length === 0) {
							return MenuItem(route, "TopMenu");
						}
						return (
							<SubMenu
								key={`submenu_${i}`}
								title={
									<span>
										<Iconfont
											style={{
												fontSize: 18,
											}}
											type={route.icon}
										/>
										{!collapsed ? route.name : ""}
									</span>
								}
							>
								{route.sublist.map((_route) => MenuItem(_route))}
							</SubMenu>
						);
					})}
				</Menu>
			</Sider>
		);
	}
}
