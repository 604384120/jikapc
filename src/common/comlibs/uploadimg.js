import React from "react";
import { Form, Upload, Icon, Modal, message } from "antd";
import ImgCrop from "antd-img-crop";
import Method from "../method";

/*图片上传组件*/
export default class Uploadimg extends React.PureComponent {
	constructor(props) {
		super();
		this.$ = new Method(props);
		this.beforeUpload = this.beforeUpload.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handlePreview = this.handlePreview.bind(this);
		this.save = this.save.bind(this);
		this.state = {
			previewVisible: false,
			previewImage: "",
			fileList: []
		};
	}

	async save(value) {
		let { save, name } = this.props;
		if (save && value) {
			let $ = this.$;
			$.loading();
			await $[save.method || "post"](
				save.api,
				Object.assign(
					{},
					{
						[name]: value
					},
					save.params || {}
				)
			);
			$.msg("已保存");
		}
	}

	handleCancel() {
		this.setState({ previewVisible: false });
	}

	handleChange({ fileList }) {
		let list = [];
		fileList.map((v, k) => {
			if (v.status === "done") {
				let src = v.response.data[0];
				list.push(src);
				fileList[k].thumbUrl = src;
			}
			if (!v.status) {
				this.$.warning(`图片[${v.name}]上传失败,请重新上传！`);
				fileList.splice(k, 1);
			}
			return "";
		});
		let listString = list.toString();
		this.props.form.setFieldsValue({
			[this.props.name]: listString
		});
		this.setState({ fileList });
		this.save(listString);
	}

	async handlePreview(file) {
		this.setState({
			previewImage: file.response.data[0],
			previewVisible: true
		});
	}

	beforeUpload(file) {
		const isLt2M = file.size / 1024 / 1024 < 2;
		const isJPG = file.type === "image/jpeg";
		const isPNG = file.type === "image/png";
		if (!isJPG && !isPNG) {
			message.error("目前只支持JPG或PNG图片上传哦!");
			return false;
		}
		if (!isLt2M) {
			message.error("目前最大只支持2M的图片上传哦!");
			return false;
		}
		return true;
	}

	UNSAFE_componentWillMount() {
		let value = this.props.value || [];
		let maxlength = this.props.maxlength || 1;
		if (!value[0] && maxlength === 1) {
			value = [];
		}
		if (typeof value === "string") {
			value = [value];
		}
		this.setState({
			fileList: value.map((url, uid) => {
				return {
					uid,
					url,
					response: {
						data: [url]
					},
					status: "done"
				};
			})
		});
	}

	render() {
		const {
			label,
			form,
			name,
			maxlength = 1,
			widthCrop,
			heightCrop,
			placeholder,
			required = false,
			disabled = false,
			labelCol,
			wrapperCol
		} = this.props;
		const {
			getFieldDecorator,
			labelCol: _labelCol,
			wrapperCol: _wrapperCol
		} = form;
		const { previewVisible, previewImage, fileList } = this.state;
		const crop = widthCrop && heightCrop ? true : false;
		const uploadButton = (
			<div>
				<Icon type="plus" />
				<div className="ant-upload-text">选择图片</div>
			</div>
		);
		const uploadCfg = {
			name: "filename",
			action: "/api/image/upload/oss?prefix=campus/cover/",
			listType: "picture-card",
			beforeUpload: this.beforeUpload,
			onPreview: this.handlePreview,
			onChange: this.handleChange,
			fileList,
			disabled
		};
		const formDom = getFieldDecorator(name, {
			initialValue: this.state.fileList.map(v => v.url).toString(),
			rules: required
				? [
						{
							required: true,
							message: placeholder
								? placeholder
								: `请先上传${label}!`
						}
				  ]
				: []
		})(
			<span>
				{crop ? (
					<ImgCrop width={widthCrop} height={heightCrop}>
						<Upload {...uploadCfg}>
							{fileList.length >= maxlength ? null : uploadButton}
						</Upload>
					</ImgCrop>
				) : (
					<Upload {...uploadCfg}>
						{fileList.length >= maxlength ? null : uploadButton}
					</Upload>
				)}
				<Modal
					visible={previewVisible}
					footer={null}
					closable={false}
					onCancel={this.handleCancel}
				>
					<img
						alt="Uploadimg"
						style={{ width: "100%" }}
						src={previewImage}
					/>
				</Modal>
			</span>
		);
		if (label) {
			return (
				<Form.Item
					label={label}
					labelCol={labelCol || _labelCol}
					wrapperCol={wrapperCol || _wrapperCol}
				>
					{formDom}
				</Form.Item>
			);
		} else {
			return <span>{formDom}</span>;
		}
	}
}
