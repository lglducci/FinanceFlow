'use client';
import { useState } from 'react';
export default function Login(){
 const[email,setEmail]=useState('');const[pwd,setPwd]=useState('');
 const go= async(e)=>{e.preventDefault();window.location.href='/dashboard';};
 return(<div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',
 background:'linear-gradient(135deg,#153b54 55%,#091219 85%)'}}>
 <form onSubmit={go} style={{background:'rgba(255,255,255,0.1)',padding:30,borderRadius:20}}>
 <h2 style={{color:'white',textAlign:'center'}}>FinanceFlow</h2>
 <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail"
 style={{display:'block',margin:'10px 0',padding:10,width:200}}/>
 <input value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Senha" type="password"
 style={{display:'block',margin:'10px 0',padding:10,width:200}}/>
 <button style={{padding:10,width:'100%',background:'#ffd24c'}}>Entrar</button>
 </form></div>);
}