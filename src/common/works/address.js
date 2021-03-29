import React,{useState,useEffect} from 'react'
import {Cascader } from 'antd'
import {$} from '../../pages/comlibs'


export default function(props){
    let [list,setList]=useState([])
    useEffect(()=>{
        getList()
    },[])
    
    async function getList(){
        let res=await $.get('/city/level.json')
        let list=res.map(obj=>({
            label:obj.name,
            value:obj.code,
            children:obj.children.map(obj=>({
                label:obj.name,
                value:obj.code,
                // children:obj.children.map(obj=>({
                //     label:obj.name,
                //     value:obj.code,  
                // }))
            }))
        }))
        setList(list)
    }

    return(
        <Cascader options={list} {...props} placeholder="请选择地区"/>
    )
}