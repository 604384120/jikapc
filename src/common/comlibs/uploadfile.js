import React from "react";
import { Progress, Upload, Button, Icon, message } from "antd";
import Method from "../method";
import Modals from "./modals";
const { Dragger } = Upload;

/*
 * uploadFile组件
 */
export default class uploadimgs extends React.PureComponent {
	constructor(props) {
		super();
		this.$ = new Method();
		this.fileCount = 0;
		this.init = this.init.bind(this);
		this.open = this.open.bind(this);
		this.beforeUpload = this.beforeUpload.bind(this);
		this.state = {
			count: 0,
			list: []
		};
	}

	beforeUpload(file) {
		return new Promise(async (resolve, reject) => {
			//待优化
			const isLt2M = file.size / 1024 / 1024 < 10;
			const isJPG = 1 || file.type === "image/jpeg";
			
			if (!isJPG) {
				//message.error("目前只支持JPG或PNG图片上传哦!");
				reject();
			}
			if (!isLt2M) {
				message.error("目前最大只支持10M的文件上传哦!");
				reject();
			}
			this.setState({
				list:[file]
			})
			resolve();
		});
	}

	open() {
		this.init();
		this.mod.status({
			title: "文件上传"
		});
	}

	sure(data) {
		let { list } = this.state;
		this.props.onSure(data || list[0].response);
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
		let { action, name = "filename", params = {}, multiple, zIndex } = this.props;
		let { count, list } = this.state;

		let _props = {
			name,
			//accept: "image/jpeg,image/png",
			action: this.$.getProxyIdentify + action,
			data: {
				...params,
				token: this.$.token()
			},
			multiple: multiple === false ? false : true,
			listType: "picture",
			fileList:list,
			className: "upload-list-inline",
			beforeUpload: this.beforeUpload,
			onRemove: () => {
				this.setState({
					list:[]
				})
				this.fileCount--;
			},
			onChange: ({ fileList }) => {
				return false
				// let list = [];
				// fileList.forEach((v, k) => {
				// 	if (v.status === "done") {
				// 		list.push(v.response);
				// 		fileList[k].thumbUrl = "";
				// 		if (multiple === false) {
				// 			this.sure(v.response);
				// 		}
				// 	}
				// 	if (!v.status) {
				// 		fileList.splice(k, 1);
				// 	}
				// });
				// if (this.fileCount < fileList.length) {
				// 	this.fileCount = fileList.length;
				// }
				// this.setState({
				// 	count: list.length,
				// 	list: list
				// });
				
			}
		};

		let going = this.fileCount - count;

		return (
			<Modals
				zIndex={zIndex}
				ref={rs => (this.mod = rs)}
				maskClosable={false}
				onCancel={() => this.init()}
			>
				<Dragger {..._props}>
					<p className="ant-upload-drag-icon">
						<Icon type="inbox" />
					</p>
					<p className="ant-upload-text">单击或拖动文件到此区域上传</p>
				</Dragger>
				<div className="ta_r mt_15">
					{this.fileCount > 0 && (
						<div className="dis_ib fs_12 pr_10 ta_l" style={{ width: 388 }}>
							共{this.fileCount}个
							<Progress
								percent={(count / this.fileCount) * 100}
								status="active"
								showInfo={false}
								style={{
									width: 290,
									margin: "0 10px"
								}}
							/>
							{going > 0 ? `剩${going}个` : `完成`}
						</div>
					)}
					<Button
						onClick={() => this.sure()}
						disabled={list.length === 0}//list.length !== this.fileCount || 
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
