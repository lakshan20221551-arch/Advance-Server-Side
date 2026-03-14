import {useState} from "react"
import API from "../api/api"

function Login(){

const [email,setEmail]=useState("")
const [password,setPassword]=useState("")

const login=async(e)=>{
e.preventDefault()

const res = await API.post("/auth/login",{email,password})

localStorage.setItem("token",res.data.token)

alert("Login successful")
}

return(
<div>

<div className="background">

    <h2>Login</h2>

    <form onSubmit={login}>

    <input onChange={e=>setEmail(e.target.value)} />

    <input type="password"
    onChange={e=>setPassword(e.target.value)} />

    <button>Login</button>

    </form>

</div>

</div>
)
}

export default Login