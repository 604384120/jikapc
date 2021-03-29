import React,{useState,useEffect} from 'react'
import {Method,Inputs} from '../../pages/comlibs'

export default function(props){
    let $=new Method()
    let [list,setList]=useState([])

    useEffect(()=>{
        (async ()=>{
            let res= await $.get('/edu/degrees/level')
            if(!res.edu_degrees)return
            setList(res.edu_degrees.map(edu=>({value:edu.level,text:edu.names.join('、')})))
        })()
    },[])

    return (
        <Inputs
              label="学历要求"
              style={{ width: 300 }}
              type="select"
              {...props}
              placeholder="请选择学历要求"
              select={list}
            />
    )
}