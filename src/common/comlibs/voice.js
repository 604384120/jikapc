import React from "react";
import Method from "../method";

/**
 * audio_url: 音频路径
 * duration: 播放时间
 */
export default class Voice extends React.Component{
    constructor(props){
        super(props)
        this.$=new Method()
        this.state={status:'normal'}
    }
    toggle(){
        if(this.state.status==='error')return
        if(this.state.status==='play'){
            this.refs.audioObj.pause()
            this.refs.audioObj.currentTime=0
            this.setState({
                status:'normal'
            })
        }else if(this.state.status==='normal'){
            this.refs.audioObj.play()
            this.setState({
                status:'play'
            })
        }
    }
    componentDidMount(){
        this.refs.audioObj.onended=()=>{
            this.setState({
                status:'normal'
            })
        }
    }
    render(){
        let Iconfont=this.$.icon()
        let arr={'error':'语音失效','normal':this.props.duration,'play':'播放中'}
        return (
            <div className="dis_f jc_sb ai_c ph_5 pointer fc_white" onClick={this.toggle.bind(this)} style={{backgroundColor:'#3FADFF',height: 30,width: 120,borderRadius: 5}}>
                <Iconfont type="icon-bofang"/>
                <span>{arr[this.state.status]}</span>
                <audio ref="audioObj" src={this.props.audio_url} onError={()=>{this.setState({status:'error'})}}/>
            </div>
        )
    }
}