import React from "react";
import { Icon } from "antd";
import Modals from "./modals";
import Method from "../method";

/**
 * video_cover :视频封面
 * video_url :视频路径
 */
export default class Video extends React.Component {
  constructor(props) {
    super(props);
    this.$ = new Method();
    this.state = { modal: {} };
  }
  start() {
    this.refs.modal.open("视频播放");
  }
  render() {
    return (
      <div>
        {this.props.video_cover ? (
          <div className="pst_rel" style={{ width: 100, height: 100 }}>
            <img
              className="wh_full br_3 pointer"
              alt={this.props.video_cover}
              onClick={this.start.bind(this)}
              src={this.props.video_cover}
            />
            <Icon
              style={{ fontSize: 40 }}
              onClick={this.start.bind(this)}
              className="fc_white pst_abs middle center"
              type="play-circle"
            />
          </div>
        ) : (
          <div onClick={this.start.bind(this)} className="fs_14 overBtn pointer">{this.props.title}</div>
        )}
        <Modals ref="modal">
          {() => (
            <video
              ref="videoObj"
              src={this.props.video_url}
              autoPlay
              onCanPlay={() => {
                this.refs.modal.refs.videoObj["disablePictureInPicture"] = true;
              }}
              controls
              className="w_full"
            />
          )}
        </Modals>
      </div>
    );
  }
}
