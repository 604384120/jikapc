import React from "react";
import { notification as Notification, Icon, Button } from "antd";
import Method from "react-ant-comlibs";
import Moment from "moment";
import $$ from "jquery";

let { default: Methods, Config, New } = Method;

Config({
	ApiCom: "/api",
	homePage: "jkCLT", //  D:\Project\Python\server\sxzfe打包部署的时候这个地址下面的文件名称
	proxyIdentify: "local",
	iconId: "font_1292940_ae4epwe42vv",
	isLocal: window.location.href.indexOf("test.com") > -1,
	deleteNullParams: true,
});

let UpdateChecking = false;
class comlibs extends Methods {
	constructor(props) {
		super();
		this.props = props;
		this.uuid = () => localStorage.uuid || "";
		this.token = () => localStorage.token || "";
		this.campus_uuid = () => localStorage.campus_uuid || "";
		// this.CheckUpdate();  版本更新提示更新检测

		if (props && props.current) {
			return this.ref(props);
		}
	}

	getQueryString(name) {
		let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		let r = window.location.search.substr(1).match(reg);
		if (r != null) return unescape(r[2]);
		return null;
	}

	maxNumText(n, unit = "") {
		return !n || n === 99999 ? "不限" : n + unit;
	}

	toScene(uuid = "") {
		return uuid.replace(/\-/g, "");
	}

	dateFormat(date, format) {
		return Moment(Date.parse(date)).format(format || "YYYY-MM-DD");
	}

	hover(selector, mouseover, mouseout) {
		$$(document).on("mouseover mouseout", selector, function (event) {
			if (event.type === "mouseover") {
				mouseover($$(this));
			} else if (event.type === "mouseout") {
				mouseout($$(this));
			}
		});
	}

	CheckUpdate() {
		if (!UpdateChecking) {
			UpdateChecking = true;
			if (localStorage.update === "YES") {
				localStorage.removeItem("update");
				Notification.success({
					message: <span className="fc_suc">提醒</span>,
					description: "更新完成!",
				});
			}
			setTimeout(() => {
				fetch(`${this.getHomePage}/update.json?_=${this.timestamp}`)
					.then((response) => response.text())
					.then((res) => {
						if (!res) {
							return false;
						}
						let info = this.strToJSON(res)[0];
						let version = info.version;
						let sure = () => {
							localStorage.version = version;
							localStorage.update = "YES";
							this.loc.reload();
						};
						if (localStorage.version !== version) {
							Notification.open({
								message: version + info.title,
								description: (
									<div>
										<div>{info.describe}</div>
										<Button
											onClick={sure.bind(this)}
											style={{
												float: "right",
												marginTop: "10px",
												fontSize: "12px",
											}}
											size="small"
											icon="check"
											type="primary"
										>
											更 新
										</Button>
									</div>
								),
								icon: <Icon type="cloud-sync" style={{ color: "#108ee9" }} />,
								duration: 10,
							});
						}
					});
				setTimeout(() => {
					UpdateChecking = false;
				}, 12000);
			}, 2000);
		}
	}

	async cityCode() {
		let res = await this.get("/city/level.json");
		let list = res.map((obj) => ({
			label: obj.name,
			value: obj.code,
			children: obj.children.map((obj) => ({
				label: obj.name,
				value: obj.code,
				children: obj.children.map((obj) => ({
					label: obj.name,
					value: obj.code,
				})),
			})),
		}));
		return list;
	}
}

export const $ = New(comlibs);
export default comlibs;
