/*
 * 公共登录窗口组件
 * 命名规则：驼峰命名
 */
import React, { useState, useEffect, useRef } from "react";
import { withRouter } from "react-router-dom";
import { Form as Forms, Icon, Modal, notification, Button } from "antd";
import { Method, Inputs, Form, Btn, Img } from "../pages/comlibs";
import "./style/login";

class Login extends React.PureComponent {
	constructor(props) {
		super();
		this.$ = new Method(props);
		this.vistor_uuid = "";
		this.loginSuccess = this.loginSuccess.bind(this);
		this.verifycode = this.verifycode.bind(this);
		this.state = {
			modalVisible: false,
		};
	}

	open() {
		this.$.store("LG_open", () => {
			let { collapsed = "", version = "", update = "" } = localStorage;
			localStorage.clear();
			localStorage.collapsed = collapsed;
			localStorage.version = version;
			localStorage.update = update;
			// this.setModalVisible(true);
			let pathname = window.location.pathname;
			if (
				pathname.indexOf("adminPc/signUp") === -1 &&
        pathname.indexOf("adminPc/wxRedirect") === -1 &&
        pathname.indexOf("adminPc/verifyGo") === -1
			) {
				window.location.href = "/adminPc/signUp?single=yes";
			}
		});
	}

	setModalVisible(modalVisible) {
		this.setState({ modalVisible });
	}

	handleSignIn() {}

	async loginSuccess(post, { btn }) {
		let $ = this.$;
		localStorage.token = post.token || "";
		localStorage.uuid = post.oper_uuid || "";
		this.setModalVisible(false);
		if (post.status === "failure") {
			notification.open({
				message: <font color="#ed4343">帐号提醒</font>,
				description: <font color="#ed4343">{post.message}</font>,
				icon: <Icon type="frown" style={{ color: "#ed4343" }} />,
				duration: 10,
			});
		} else {
			notification.open({
				message: "帐号提醒",
				description: "登录成功！请记好您的帐号和密码哦~",
				icon: <Icon type="smile" style={{ color: "#108ee9" }} />,
				duration: 3,
			});
		}
		let store = $.store();
		let history = this.props.history;
		let location = history.location;
		btn.loading = false;
		if (location.pathname.split("/").length < 3) {
			location.pathname = store.GlobalIndexPage;
		}
		await store.SMT_getUserData();
		history.push(location);
	}

	verifycode(_props) {
		let $ = this.$;
		let [num, setNum] = useState(60);
		let [disabled, setDisabled] = useState(false);
		let get = () => {
			let { phone: phone } = _props.form.getFieldsValue(["phone"]);
			if (!phone) {
				$.warning("请输入手机号后再获取验证码！");
				return false;
			}
			// if (!captcha_code) {
			// 	$.warning("请输入效验码后再获取验证码！");
			// 	return false;
			// }
			setDisabled(true);
			let closeInter = () => {
				setDisabled(false);
				setNum(60);
				clearInterval(inter);
			};
			let inter = setInterval(() => {
				if (num < 2) {
					closeInter();
				} else {
					num--;
					setNum(num);
				}
			}, 1000);
			(async () => {
				await $.post(
					"/verifycode",
					{
						phone,
						// captcha_code,
						// vistor_uuid: this.vistor_uuid
					},
					() => {
						closeInter();
						// this.captchaInit.current.get();
					}
				);
				$.msg("验证码已发送，请注意查看手机！");
			})();
		};
		return (
			<Button
				className="box"
				style={{
					padding: 0,
					fontSize: 13,
					color: "#333333",
				}}
				onClick={get.bind(this)}
				disabled={disabled}
			>
				{disabled ? `请稍等${num}秒` : "获取短信验证码"}
			</Button>
		);
	}

	render() {
		this.open();
		let Verifycode = this.verifycode;
		return (
			<Modal
				className="loginModal"
				centered
				closable={false}
				keyboard={false}
				maskClosable={false}
				visible={this.state.modalVisible}
				footer={null}
				width={740}
				bodyStyle={{ padding: 0 }}
				style={{ borderRadius: 10, overflow: "hidden" }}
			>
				{this.state.modalVisible && (
					<Form
						onSubmit={async (values, btn, ext) => {
							btn.loading = false; //关闭提交按钮loading加载状态
							if (ext === "signUp") {
								let rs = await this.$.post("/user/signup", values);
								// this.loginSuccess(rs, { btn, values });
							} else {
								let rs = await this.$.post("/user/login/phone", values);
								this.loginSuccess(rs, { btn, values });
							}
						}}
						// action="/user/login/phone"
						// method="POST"
						className="login-form"
						style={{ marginBottom: "10px" }}
						// success={this.loginSuccess}
					>
						{({ form, submit }) => (
							<div className="box box-rev">
								<div className="box">
									<Img
										style={{
											borderRadius: "10px 0px 0px 10px",
											// height: this.state.signIn && 378,
										}}
										width="330"
										src="https://sxzimgs.oss-cn-shanghai.aliyuncs.com/yingxiao/page/9bc24434-e74b-11ea-8baa-00163e04cc20.png"
									/>
								</div>
								<div className="box-1">
									<h2
										className="fs_20 fc_blue ta_c pt_15"
										style={{ fontWeight: 600, marginTop: 40 }}
									>
										欢迎登录
									</h2>
									<div
										style={{
											width: 316,
											boxSizing: "content-box",
											paddingLeft: 60,
										}}
									>
										<Inputs
											className="input_wrap"
											form={form}
											name="phone"
											item={true}
											required={true}
											placeholder="请输入手机号"
										/>
										<Inputs
											className="input_wrap"
											item={true}
											form={form}
											name="passwd"
											required={true}
											placeholder="请输入密码"
										/>
										{/* {this.state.signIn && (
											<div
												className="box box-ac input_wrap flex-between"
												style={{ marginBottom: "10px" }}
											>
												<Inputs
													form={form}
													name="verify"
													required={true}
													placeholder="请输入验证码"
												/>
												<Verifycode form={form} />
											</div>
										)} */}
										{/* <a
											onClick={() =>
												this.setState({ signIn: !this.state.signIn })
											}
										>
											{"还没有集卡e家帐号？ 立即注册>>"}
										</a> */}
										<Forms.Item
											className="input_wrap"
											style={{ border: "none", marginTop: 35 }}
										>
											{/* {this.state.signIn ? (
												<Btn
													width="100%"
													size="large"
													onClick={(e) => submit(e, "signUp")}
												>
													{" "}
													注 册{" "}
												</Btn>
											) : ( */}
												<Btn
													width="100%"
													size="large"
													onClick={(e) => submit(e)}
												>
													{" "}
													登 录{" "}
												</Btn>
											{/* )} */}
										</Forms.Item>
									</div>
								</div>
							</div>
						)}
					</Form>
				)}
			</Modal>
		);
	}
}

export default withRouter(Login);
