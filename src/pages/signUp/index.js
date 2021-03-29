/*
 * 公共登录窗口组件
 * 命名规则：驼峰命名
 */
import React, { useState, useEffect, useRef } from "react";
import { withRouter } from "react-router-dom";
import {
	Form as Forms,
	Icon,
	Drawer,
	notification,
	Button,
	Divider,
	Modal,
} from "antd";
import { Method, Inputs, Form, Btn, Img } from "../comlibs";
import "./index.css";

class SignUp extends React.PureComponent {
	constructor(props) {
		super();
		this.$ = new Method(props);
		this.vistor_uuid = "";
		this.loginSuccess = this.loginSuccess.bind(this);
		this.verifycode = this.verifycode.bind(this);
		this.state = {
			modalVisible: false,
			// signIn: false,
			captcha_img: "",
			wxUrl: {},
			wxModalVisible: false,
		};
		(async () => {
			let $ = new Method(props);
			let capImg = await $.get("/captcha");
			this.setState({ captcha_img: capImg });
			// let url = await $.get("/user/wxlogin/url", {state: 'debug'});// 本地起来需要传参
			let url = await $.get("/user/wxlogin/url");
			this.setState({ wxUrl: url });
    })();
    // if (window.location.search.indexOf('error') >= 0) {
    //   setTimeout(()=>{
    //     this.$.warning(decodeURI(escape(this.$.getQueryString("error"))))
    //   },10)
    // }
	}

	open() {
		this.$.store("LG_open", () => {
			let { collapsed = "", version = "", update = "" } = localStorage;
			localStorage.clear();
			localStorage.collapsed = collapsed;
			localStorage.version = version;
			localStorage.update = update;
			// if (window.location.pathname.indexOf("adminPc/signUp") === -1) {
			// 	window.location.href = "/adminPc/signUp?single=yes";
			// }
			// if (window.location.pathname.indexOf("adminPc/password") === -1) {
			// 	window.location.href = "/adminPc/password?single=yes";
			// }
		});
	}

	setModalVisible(modalVisible) {
		this.setState({ modalVisible });
	}

	async loginSuccess(post, { btn }) {
    let $ = this.$;
		localStorage.token = post.token || "";
		localStorage.uuid = post.oper_uuid || "";
		// this.setModalVisible(false);
		// if (post.status === "failure") {
		// 	notification.open({
		// 		message: <font color="#ed4343">帐号提醒</font>,
		// 		description: <font color="#ed4343">{post.message}</font>,
		// 		icon: <Icon type="frown" style={{ color: "#ed4343" }} />,
		// 		duration: 10,
		// 	});
		// } else {
		// 	notification.open({
		// 		message: "帐号提醒",
		// 		description: "登录成功！请记好您的帐号和密码哦~",
		// 		icon: <Icon type="smile" style={{ color: "#108ee9" }} />,
		// 		duration: 3,
		// 	});
		// }
		let store = $.store();
		let history = this.props.history;
		let location = history.location;
		btn.loading = false;
		if (location.pathname.split("/").length < 3) {
			location.pathname = store.GlobalIndexPage;
		}
		await store.SMT_getUserData();
    history.push(location);
    if (post.token) {
      let rs = await $.get("/user/info", {token: post.token});
      if (!rs) return;
      if (rs.verify_material.verify_type === 'VISITER' && rs.verify_material.verify === 'NO') {// 已经注册但未提交认证，状态：未认证
        window.location.href='/adminPc/verifyGo?single=yes'
      } else if (rs.verify_material.verify_type !== 'VISITER' && rs.verify_material.verify === 'NO') {// 已经注册并提交认证但被驳回，状态：认证失败
        window.location.href='/adminPc/verify'
      } else {//  状态：已认证
        window.location.href='/adminPc/buyCar'
      }
    }
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
				style={{
					padding: "0 5px",
					fontSize: 13,
					color: "#333333",
					marginLeft: 10,
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
		// let WxModal=this.WxModal.bind(this)
		return (
			<div className="welcomeBox loginModal welcomeBox1">
				<div className="titleWel">
					<img src="https://sxzimgs.oss-cn-shanghai.aliyuncs.com/yingxiao/page/d60e4364-f32f-11ea-aba9-00163e0e1996.png"></img>
					集卡e家企业车队管理平台
				</div>
				<div className="welcome">
					<Form
						onSubmit={async (values, btn, ext) => {
							btn.loading = false; //关闭提交按钮loading加载状态
							// if (ext === "signUp") {
							// 	let rs = await this.$.post("/user/signup", values);
							// 	// this.loginSuccess(rs, { btn, values });
							// } else {
								let rs = await this.$.post("/user/login/phone", values);
								this.loginSuccess(rs, { btn, values });
								// window.location.href = "/adminPc/buyCar";
							// }
						}}
						// action="/user/login/phone"
						// method="POST"
						className="login-form"
						style={{ marginBottom: "10px" }}
						// success={this.loginSuccess}
					>
						{({ form, submit }) => (
							<div className="box box-rev">
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
											<div className="box box-ac input_wrap flex-between">
												<Inputs
													form={form}
													name="verify"
													required={true}
													placeholder="请输入验证码"
												/>
												<Verifycode form={form} />
											</div>
										)} */}
										<a
											className="resetPassword"
											onClick={() => this.setModalVisible(true)}
										>
											忘记密码
										</a>
										<Forms.Item
											className="input_wrap"
											style={{ border: "none", marginTop: 20 }}
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
					<a onClick={() => this.setState({ wxModalVisible: !this.state.wxModalVisible })}>
						{"还没有集卡e家帐号？ 立即注册>>"}
					</a>
					<Divider>您还可用以下帐号登录</Divider>
					<img
						src="https://sxzimgs.oss-cn-shanghai.aliyuncs.com/yingxiao/page/c13bc4a4-f332-11ea-aba9-00163e0e1996.png"
						onClick={() => this.setState({ wxModalVisible: !this.state.wxModalVisible })}
					></img>
				</div>
				<Drawer
					title="忘记密码"
					width="100%"
					placement="right"
					closable={() => this.setModalVisible(false)}
					onClose={() => this.setModalVisible(false)}
					visible={this.state.modalVisible}
					bodyStyle={{ paddingBottom: 80 }}
				>
					<Form
						onSubmit={async (values, btn, ext) => {
							btn.loading = false; //关闭提交按钮loading加载状态
							if (values.passwd !== values.newPasswd) {
								this.$.msg("密码输入不一样，请重新输入！");
								return;
							}
							let rs = await this.$.post("/user/reset/passwd", values);
							// this.loginSuccess(rs, { btn, values });
							// window.location.href="/adminPc/buyCar"
							this.$.msg("修改成功");
							this.setModalVisible(false);
						}}
						style={{ marginBottom: "10px" }}
					>
						{({ form, submit }) => (
							<div className="passwordBox">
								<div className="passwordItem">
									<span className="passwordTitle">手机号</span>
									<Inputs
										className="passwordInp"
										form={form}
										name="phone"
										item={true}
										required={true}
										placeholder="请输入手机号"
									/>
								</div>
								<div className="passwordItem">
									<span className="passwordTitle">新密码</span>
									<Inputs
										className="passwordInp"
										item={true}
										form={form}
										name="passwd"
										required={true}
										placeholder="请输入新密码"
									/>
								</div>
								<div className="passwordItem">
									<span className="passwordTitle">再次输入密码</span>
									<Inputs
										className="passwordInp"
										item={true}
										form={form}
										name="newPasswd"
										required={true}
										placeholder="请再次输入新密码"
									/>
								</div>
								{/* <div className='passwordItem'>
                  <span className='passwordTitle'>校验码</span>
                  <Inputs
                    className="passwordInp"
                    item={true}
                    form={form}
                    name="passwd"
                    required={true}
                    placeholder="请输入校验码"
                  />
                  
                </div> */}
								<div className="passwordItem">
									<span
										className="passwordTitle"
										style={{ marginRight: "10px" }}
									>
										验证码
									</span>
									<Inputs
										form={form}
										name="verify"
										required={true}
										placeholder="请输入验证码"
									/>
									<Verifycode form={form} />
								</div>
								<Forms.Item
									className="input_wrap"
									style={{ border: "none", marginTop: 20 }}
								>
									<Btn width="100%" size="large" onClick={(e) => submit(e)}>
										{" "}
										提 交{" "}
									</Btn>
								</Forms.Item>
							</div>
						)}
					</Form>
				</Drawer>
				<Modal
					visible={this.state.wxModalVisible}
					onCancel={() => this.setState({ wxModalVisible: false })}
					style={{ height: "400px", textAlign: 'center' }}
					footer={null}
				>
					{/* {window.addEventListener(
            "message",
            (e) => {
              console.log(e)
            },
            false
          )} */}
					{/* {this.wxModal(this.state)}
          <div id='wx_login_container'></div> */}
					<iframe
						style={{ height: "400px" }}
						scrolling="auto"
						frameBorder="0"
						src={this.state.wxUrl.url}
					></iframe>
				</Modal>
			</div>
		);
	}
}

export default withRouter(SignUp);
