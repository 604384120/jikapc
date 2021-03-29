import React,{useState,useEffect} from 'react'
import {Method,Inputs} from '../../pages/comlibs'

export default function(props){
    let $=new Method()
    let [list,setList]=useState([])

    useEffect(()=>{
        (async ()=>{
            let res= await $.get('/ext/edu/degrees')
            if(!res.ext_edu_degrees)return
            setList(res.ext_edu_degrees.map(edu=>({value:edu.id,text:edu.name})))
        })()
    },[])

    return (
        <Inputs
              style={{ width: 200 }}
              type="select"
              {...props}
              placeholder="请选择培训等级"
              select={list}
            />
    )
}