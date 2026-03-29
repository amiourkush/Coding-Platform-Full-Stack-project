import { Routes , Route } from "react-router";
import Homepage from "./pages/Homepage";
import Signpage from "./pages/Signpage";


function App(){
    return(
        <>
        <Routes>
            <Route path="/" element={<Homepage/>}></Route>
            {/* <Route path="/login" element={<Loginpage/>}></Route> */}
            <Route path="/signup" element={<Signpage/>}></Route>

        </Routes>
        </>
    )

}

export default App;