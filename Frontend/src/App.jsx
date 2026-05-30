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
import UpdateProblem from "./components/UpdateProbelm";
import DeleteProblem from "./components/DeleteProblem";
import UploadVideo from "./components/UploadVideo"
import Uploading from "./components/Uploading";


function App(){

   const {isAuthenticated,loading,user}= useSelector((state)=>state.auth);
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
             {/* <Route path="/" element={<Homepage/>}></Route>  */}
             <Route path="/" element={isAuthenticated ?<Homepage/>:<Navigate to="/signup" />}></Route>
            <Route path="/login" element={isAuthenticated ?<Navigate to="/" />:<Loginpage/>}></Route>
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/" />:<Signpage/>}></Route>
            <Route path="/problem/:id" element={isAuthenticated ?<ProblemPage/>:<Navigate to="/signup"/>}></Route>
            <Route path="/admin" element={isAuthenticated && user.role=="admin" ?<AdminPage/>:<Navigate to="\"/>}></Route>
            <Route path="/create" element={isAuthenticated && user.role=="admin" ?<CreateProblem/>:<Navigate to="\"/>}></Route>
            <Route path="/update/:id" element={isAuthenticated && user.role=="admin" ?<UpdateProblem></UpdateProblem>:<Navigate to="\"/>}></Route>
            <Route path="/delete" element={isAuthenticated && user.role=="admin" ?<DeleteProblem/>:<Navigate to="\"/>}></Route>
            <Route path="/admin/upload" element={isAuthenticated && user.role=="admin" ?<UploadVideo/>:<Navigate to="\"/>}></Route>
            <Route path="/admin/uploading/:problemId" element={isAuthenticated && user.role=="admin" ?<Uploading/>:<Navigate to="\"/>}></Route>    

        </Routes>
        </>
    )

}

export default App;