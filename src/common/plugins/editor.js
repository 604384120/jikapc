import React from "react";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "@ckeditor/ckeditor5-build-classic/build/translations/zh-cn";
import Method from "../method";

export default class Editor extends React.Component {
	render() {
		const $ = new Method();
		let { value, placeholder, onChange, disabled = false } = this.props;
		return (
			<CKEditor
				editor={ClassicEditor}
				data={value}
				config={{
					placeholder,
					toolbar: [
						"heading",
						"|",
						"alignment",
						"highlight",
						"bold",
						"italic",
						"bulletedList",
						"numberedList",
						"imageUpload",
						"blockQuote",
						"insertTable",
						"undo",
						"redo"
					],
					language: "zh-cn",
					ckfinder: {
						uploadUrl: $.getProxyIdentify + "/image/ckupload/oss?prefix=image/editor/"
					}
				}}
				onChange={(event, editor) => {
					onChange && onChange(editor.getData());
				}}
				disabled={disabled}
			/>
		);
	}
}
