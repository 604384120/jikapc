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
import { Method, Inputs, Form, Btn, Img, $ } from "../comlibs";
import "./index.css"
// import { supportsHistory } from "history/DOMUtils";

class Wx extends React.PureComponent {
	constructor(props) {
    super();
    let $ = new Method(props);
    
    let nickname = $.getQueryString("nickname");
    let avatar = $.getQueryString("useravatar");
    let ionid = $.getQueryString("unionid");
    let openid = $.getQueryString("web_openid");
		//如果包含中文需要转码下
		let name = nickname && decodeURI(escape(nickname));
		let useravatar = decodeURI(escape(avatar));
		let unionid = decodeURI(escape(ionid));
    let web_openid = decodeURI(escape(openid));

    this.state = {
      name: name && name,
      useravatar: useravatar,
			unionid: unionid || null,
			web_openid: web_openid || null,
			visible: false,
    };
    this.verifycode = this.verifycode.bind(this);
    this.loginSuccess = this.loginSuccess.bind(this);

    //  跳转
    if (window.location.search.indexOf('token') >= 0) {
      setTimeout(async ()=>{
        localStorage.token = $.getQueryString("token") || "";
        let store = $.store();
        let history = this.props.history;
        let location = history.location;
        if (location.pathname.split("/").length < 3) {
          location.pathname = store.GlobalIndexPage;
        }
        store.SMT_getUserData();
        let rs = await $.get("/user/info", );
        if (!rs) return
        if (rs.verify_material.verify_type === 'VISITER' && rs.verify_material.verify === 'NO') {
          window.location.href='/adminPc/verifyGo?single=yes'
        } else if (rs.verify_material.verify_type !== 'VISITER' && rs.verify_material.verify === 'NO') {
          window.location.href='/adminPc/verify'
        } else {
          window.location.href='/adminPc/buyCar'
        }
      },10)
    }

    if (window.location.search.indexOf('error') >= 0) {
      setTimeout(()=>{
        window.location.href=`/adminPc/signUp?error=${decodeURI(escape($.getQueryString("error")))}&single=yes`;
      },10)
    }
  };
  
  async loginSuccess(post, { btn }) {
		localStorage.token = post.token || "";
		// localStorage.uuid = post.oper_uuid || "";
		// this.setModalVisible(false);
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
		let $ = new Method(_props);
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
	};

	render() {
    if (this.state.name) {
      this.setState({visible: true})
    }
    let Verifycode = this.verifycode;
    
    return this.state.visible && (
			<div className="welcomeBox loginModal">
				<div className="titleWel">
					<img src="https://sxzimgs.oss-cn-shanghai.aliyuncs.com/yingxiao/page/d60e4364-f32f-11ea-aba9-00163e0e1996.png"></img>
					集卡e家企业车队管理平台
				</div>
				<div className="welcome welcome1">
          <span>注册</span>
					<Form
						onSubmit={async (values, btn, ext) => {
              if (values.passwd !== values.password) {
                $.msg('密码不一致，请重新输入');
                return
              }
              values.user_name = this.state.name
              values.user_avatar = this.state.useravatar
              values.unionid = this.state.unionid
              values.web_openid = this.state.web_openid
              btn.loading = false; //关闭提交按钮loading加载状态
              let rs = await $.post("/user/signup", values);
              if (!rs) return
              let res = await $.post("/user/login/phone", values);
              if (!res) return
              localStorage.token = res.token || "";
              window.location.href='/adminPc/verifyGo?single=yes'
						}}
						className="login-form"
						style={{ marginBottom: "10px" }}
					>
						{({ form, submit }) => (
							<div className="box box-rev">
								<div className="box-1">
									<div className='sinUpTitle'>
                    <img src={decodeURIComponent(this.state.useravatar)}></img>
                    <div>{this.state.name}</div>
                    <span>微信已授权，请绑定手机号！</span>
                  </div>
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
										<Inputs
											className="input_wrap"
											item={true}
											form={form}
											name="password"
											required={true}
											placeholder="请再次输入密码"
										/>
                    <div className="box box-ac input_wrap flex-between">
                      <Inputs
                        form={form}
                        name="verify"
                        required={true}
                        placeholder="请输入短信验证码"
                      />
                      <Verifycode form={form} />
                    </div>
										<Forms.Item
											className="input_wrap"
											style={{ border: "none", marginTop: 20 }}
										>
                    <Btn
                      width="100%"
                      size="large"
                      onClick={(e) => submit(e, "signUp")}
                    >
                      {" "}
                      下 一 步 {" "}
                    </Btn>
										</Forms.Item>
									</div>
								</div>
							</div>
						)}
					</Form>
				</div>
			</div>
		);
	}
}

export default withRouter(Wx);
