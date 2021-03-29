import React from "react";
import { Progress, Upload, Button, Icon, message } from "antd";
import Method from "../method";
import Modals from "./modals";
const { Dragger } = Upload;

/*
 * uploadimgs组件
 */
export default class uploadimgs extends React.PureComponent {
	constructor(props) {
		super();
		this.$ = new Method(props);
		this.fileCount = 0;
		this.init = this.init.bind(this);
		this.open = this.open.bind(this);
		this.beforeUpload = this.beforeUpload.bind(this);
		this.state = {
			count: 0,
			list: [],
			ossToken: { expire: 0 },
			certificate: {}
		};
	}

	async oss(file) {
		let data = await this.$.get("/oss/token", { file_type: "image" });
		let ossToken = data.token;
		file._name = `${this.$.guid()}.${file.name.split(".")[1]}`;
		this.setState({
			ossToken,
			certificate: {
				url: ossToken.host,
				data: {
					key: this.props.prefix + file._name,
					policy: ossToken.policy,
					OSSAccessKeyId: ossToken.accessid,
					success_action_status: "200",
					signature: ossToken.signature
				}
			}
		});
	}

	beforeUpload(file) {
		return new Promise(async (resolve, reject) => {
			const isLt2M = file.size / 1024 / 1024 < 10;
			const isJPG = file.type === "image/jpeg";
			const isPNG = file.type === "image/png";

			if (!isJPG && !isPNG) {
				message.error("目前只支持JPG或PNG图片上传哦!");
				reject();
			}
			if (!isLt2M) {
				message.error("目前最大只支持10M的图片上传哦!");
				reject();
			}
			await this.oss(file);
			resolve();
		});
	}

	open() {
		this.init();
		this.mod.status({
			title: "图片上传"
		});
	}

	sure(string, ary) {
		let { list, listString } = this.state;
		this.props.onSure(string || listString, ary || list);
		this.init();
		this.mod.status({
			show: false
		});
	}

	init() {
		this.fileCount = 0;
		this.setState({
			count: 0,
			list: []
		});
	}

	render() {
		let { multiple, prefix = "upload/image/" } = this.props;
		let { certificate, count, list } = this.state;

		let _props = {
			name: "file",
			accept: "image/jpeg,image/png",
			multiple: multiple === false ? false : true,
			listType: "picture",
			className: "upload-list-inline",
			action: certificate.url,
			data: certificate.data,
			beforeUpload: this.beforeUpload,
			onRemove: () => {
				this.fileCount--;
			},
			onChange: ({ fileList }) => {
				let list = [];
				fileList.forEach((v, k) => {
					if (v.status === "done") {
						let src = `${certificate.url}/${prefix + v._name}`;
						list.push(src);
						fileList[k].thumbUrl = src;
						if (multiple === false) {
							this.sure(src, [src]);
						}
					}
					if (!v.status) {
						fileList.splice(k, 1);
					}
				});
				if (this.fileCount < fileList.length) {
					this.fileCount = fileList.length;
				}
				this.setState({
					count: list.length,
					list: list,
					listString: list.toString()
				});
			}
		};

		let going = this.fileCount - count;

		return (
			<Modals
				{...this.props}
				ref={rs => (this.mod = rs)}
				maskClosable={false}
				onCancel={() => this.init()}
			>
				<Dragger {..._props}>
					<p className="ant-upload-drag-icon">
						<Icon type="inbox" />
					</p>
					<p className="ant-upload-text">单击或拖动图片到此区域上传</p>
					<p className="ant-upload-hint">
						{multiple === false
							? "当前操作只需上传一张图片哦~"
							: "支持单个或批量上传，批量选择支持按住Shift或Ctrl+A进行操作"}
					</p>
				</Dragger>
				<div className="ta_r mt_15">
					{this.fileCount > 0 && (
						<div className="dis_ib fs_12 pr_10 ta_l" style={{ width: 388 }}>
							共{this.fileCount}张
							<Progress
								percent={(count / this.fileCount) * 100}
								status="active"
								showInfo={false}
								style={{
									width: 290,
									margin: "0 10px"
								}}
							/>
							{going > 0 ? `剩${going}张` : `完成`}
						</div>
					)}
					<Button
						onClick={() => this.sure()}
						disabled={list.length !== this.fileCount || list.length === 0}
						type="primary"
						icon="check"
					>
						确 定
					</Button>
				</div>
			</Modals>
		);
	}
}
