import React from "react";
import { Upload, Button, Icon } from "antd";

export default class fn extends React.PureComponent {
  constructor() {
    super();
    this.handleUpload = this.handleUpload.bind(this);
    this.state = {
      fileList: []
    };
  }

  handleUpload = (list = []) => {
    setTimeout(() => {
      const { fileList } = this.state;
      this.props.onChange(list[0] || fileList[0] || "");
    }, 500);
  };

  render() {
    const {
      title = "点击上传",
      size = "default",
      showUploadList = true
    } = this.props;
    const { fileList } = this.state;
    const _props = {
      onRemove: file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          this.handleUpload(newFileList);
          return {
            fileList: newFileList
          };
        });
      },
      beforeUpload: file => {
        this.setState(state => ({
          fileList: [file]
        }));
        return false;
      },
      fileList
    };

    return (
      <Upload
        name="test"
        showUploadList={showUploadList}
        {..._props}
        onChange={this.handleUpload}
      >
        <Button size={size}>
          <Icon type="upload" /> {title}
        </Button>
      </Upload>
    );
  }
}
