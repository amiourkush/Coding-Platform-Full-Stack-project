import { useDispatch,useSelector } from "react-redux";
import { useState } from "react";
import { useEffect } from "react";
import { logout } from "../authSlice";
import axiosClient from "../utils/axiosClient";

function Homepage(){

    const {user} = useSelector((state)=>state.auth);
    const dispatch =useDispatch();
    const [problem,setProblem] = useState([]);
    const [solvedProblem,setSolvedProblem] =useState([]);
    const [filter,setFilter] = useState({
      difficulty:"all",
      tags:"all",
      status:"all"
    })
    const [dropOption,setDropOption]=useState(false);

    const handlelogout =async()=>{
      await dispatch(logout());

    }
    useEffect(()=>{
      const fetchAllproblem =async()=>{
        try{
          const response = await axiosClient.get("/problem/getAllProblem");
          setProblem(response.data);
        }catch(err){
          console.log("Error " +err);
        }
      }
      fetchAllproblem();
    },[])
   
    return(
       <>
       <div className="h-screen bg-[#0f0f0f] text-gray-200 flex flex-col">

  {/* Navbar */}
  <div className="flex justify-between items-center px-8 py-4 bg-[#1a1a1a] shadow-md">
    <h1 className="text-xl font-semibold tracking-wide">LeetCode</h1>

    <div className="relative">
      <button
        className="px-4 py-1 border border-gray-600 rounded-lg hover:bg-gray-800 transition"
        onClick={() => setDropOption(!dropOption)}
      >
        {user ? user.firstName : "Guest"}
      </button>

      {dropOption && (
        <div className="absolute right-0 mt-2 w-32 bg-[#1f1f1f] border border-gray-700 rounded-lg shadow-lg">
          <div className="px-4 py-2 hover:bg-gray-800 cursor-pointer" onClick={handlelogout}>
            Logout
          </div>
        </div>
      )}
    </div>
  </div>

  {/* Filters */}
  <div className="flex justify-center gap-10 py-4 bg-[#141414] border-b border-gray-800">

    <select
      value={filter.status}
      onChange={(e) => setFilter({...filter,status:e.target.value})}
      className="bg-[#1f1f1f] px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
    >
      <option value="allproblem">All Problems</option>
      <option value="solvedproblem">Solved</option>
    </select>

    <select
      value={filter.difficulty}
      onChange={(e) => setFilter({...filter,difficulty:e.target.value})}
      className="bg-[#1f1f1f] px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
    >
      <option value="Easy">Easy</option>
      <option value="Medium">Medium</option>
      <option value="Hard">Hard</option>
    </select>

    <select
      value={filter.tags}
      onChange={(e) => setFilter({...filter,tags:e.target.value})}
      className="bg-[#1f1f1f] px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
    >
      <option value="Array">Array</option>
      <option value="Linked List">Linked List</option>
      <option value="String">String</option>
    </select>

  </div>

  {/* Content Area */}
  <div className="flex-1 p-6 overflow-auto">

    <div className="bg-[#1a1a1a] rounded-xl p-6 shadow-md border border-gray-800">
      <h2 className="text-lg font-semibold mb-4">Problems</h2>
       {
        problem.map(problem=><div key={problem._id}  className="flex justify-between items-center py-3 border-b border-gray-800 hover:bg-[#222] px-3 rounded-md transition">
        <span>{problem.title}</span>
        <span className="text-green-400 text-sm">{problem.difficulty}</span></div>)
       }
     

      {/* <div className="flex justify-between items-center py-3 border-b border-gray-800 hover:bg-[#222] px-3 rounded-md transition">
        <span>3Sum</span>
        <span className="text-yellow-400 text-sm">Medium</span>
      </div>

      <div className="flex justify-between items-center py-3 hover:bg-[#222] px-3 rounded-md transition">
        <span>Merge K Lists</span>
        <span className="text-red-400 text-sm">Hard</span>
      </div> */}

    </div>

  </div>

</div>
       </>)
      
 }

 export default Homepage;



 