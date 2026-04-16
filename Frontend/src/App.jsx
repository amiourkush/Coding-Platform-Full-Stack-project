import { Routes , Route , Navigate } from "react-router";
import Homepage from "./pages/Homepage";
import Signpage from "./pages/signpage";
import Loginpage from "./pages/Loginpage"
import AdminPage from "./pages/AdminPage";
import { useDispatch, useSelector} from "react-redux";
import {check} from "./authSlice";
import { useEffect } from "react";
import Loader from "./utils/Loading";
import ProblemPage from "./pages/ProblemPage";
import CreateProblem from "./components/CreateProblem";


function App(){

   const {isAuthenticated,loading}= useSelector((state)=>state.auth);
   const dispatch = useDispatch();
   useEffect(()=>{
    dispatch(check());
   },[dispatch]);    
   if (loading) {
    return <Loader/>;
  }                                 // it will render only once

    return(
        <>
        <Routes>
             {/* <Route path="/" element={<Homepage/>}></Route> 
             <Route path="/" element={isAuthenticated ?<Homepage/>:<Navigate to="/signup" />}></Route>
            <Route path="/login" element={isAuthenticated ?<Navigate to="/" />:<Loginpage/>}></Route>
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/" />:<Signpage/>}></Route>
            <Route path="/problem/:id" element={<ProblemPage/>}></Route>
            <Route path="/admin" element={<AdminPage/>}></Route>
            <Route path="/create" element={<CreateProblem/>}></Route> */}

        </Routes>
        </>
    )

}

export default App;