import { useDispatch,useSelector } from "react-redux";
import { useState } from "react";

function Homepage(){

    const {user} = useSelector((state)=>state.auth);
    const [status,setStatus] = useState("");
    const [difficulty,setDifficulty]=useState("");
    const [tags,setTags]=useState("");
    const [dropOption,setDropOption]=useState(false);
    return(
       <>
       <div className="min-h-screen bg-blue-950">
        <div className="flex justify-between flex-row w-full h-[20%] pl-15 pr-6 text-base p-6 bg-blue-900">
            <h1 className="text-blue-50 text-2xl">LeetCode</h1>
            <div className="relative">
            <button className="text-white text-l border rounded-xl pl-4 pr-5 " onClick={()=>setDropOption(!dropOption)}>{user?user.firstName:"Guest"}</button>
            {
                dropOption && (<div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg w-32">
              <div className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                Logout
              </div>
            </div>)
            }
          </div>
        </div>
        <div className="flex flex-row justify-center gap-60 mt-5">
            <select value={status}
              onChange={(e)=>setStatus(e.target.value)} className="bg-black  px-3 appearance-none rounded focus:outline-none focus:ring-2 focus:ring-yellow-400">
                <option value="allproblem" >All problem</option>
                <option value="solvedproblem">Solved Problem</option>
            </select>
            <select value={difficulty} onChange={(e)=>setDifficulty(e.target.value)} className="bg-black  px-3 appearance-none rounded focus:outline-none focus:ring-2 focus:ring-yellow-400">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
            </select>
            <select value={tags} onChange={(e)=>setTags(e.target.value)} className="bg-black  px-3 appearance-none rounded focus:outline-none focus:ring-2 focus:ring-yellow-400">
                <option value="Array">Array</option>
                <option value="Linked List">Linked List</option>
                <option value="String">String</option>
            </select>
        </div>
        <div></div>

       </div>
       
       
       </>
    )
 }

 export default Homepage;



 