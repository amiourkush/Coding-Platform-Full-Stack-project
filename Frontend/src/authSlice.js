import {createSlice,createAsyncThunk, isRejectedWithValue} from "@reduxjs/toolkit"
import axiosClient from "./utils/axiosClient";

export const registerUser = createAsyncThunk("auth/register",async(userData,{rejectWithValue})=>{
    try{
        const response=await axiosClient.post("/user/register",userData);
        return response.data.user;  //here this response has following format  response ={  data :{user : reply, message : "inavalid"}, status_code : ...etc}
        }catch(err){
            return rejectWithValue(err);
        }
}) 

export const loginUser = createAsyncThunk(
    "auth/login",
    async(Credentials,{rejectWithValue})=>{
        try{
            const response = await axiosClient.post("/user/login",Credentials);
            return response.data.user;
        }catch(error){
            return rejectWithValue(error);
        }
    }
)

export const check = createAsyncThunk(
    "auth/check",
    async(_,{rejectWithValue})=>{
        try{
            const response = await axiosClient.get("/user/check");
            return response.data.user;
        }catch(error){
            return rejectWithValue(error);
        }
    }
)

export const logout = createAsyncThunk(
    "auth/logout",
    async(_,{rejectWithValue})=>{
        try{
            const response = await axiosClient.post("/user/logout");
            return null;
        }catch(error){
            return rejectWithValue(error);
        }
    }
)

const authSlice = createSlice({
    name : "auth",
    initialState :{
        user:null,
        isAuthenticated : false,
        loading : false,
        error : null
    },
    reducers :{},
    extraReducers :(builders)=>{
        builders
        .addCase(registerUser.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(registerUser.fulfilled,(state,actions)=>{
            state.loading = false;
            state.isAuthenticated=!!actions.payload;
            state.user = actions.payload;

        })
        .addCase(registerUser.rejected,(state,actions)=>{
            state.loading = false;
            state.error = actions.payload?.message || "something went wrong";
            state.isAuthenticated = false;
            state.user = null;
        })
        .addCase(loginUser.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(loginUser.fulfilled,(state,actions)=>{
            state.loading = false;
            state.isAuthenticated=!!actions.payload;
            state.user = actions.payload;

        })
        .addCase(loginUser.rejected,(state,actions)=>{
            state.loading = false;
            state.error = actions.payload?.message || "something went wrong";
            state.isAuthenticated = false;
            state.user = null;
        })
        .addCase(check.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(check.fulfilled,(state,actions)=>{
            state.loading = false;
            state.isAuthenticated=!!actions.payload;
            state.user = actions.payload;

        })
        .addCase(check.rejected,(state,actions)=>{
            state.loading = false;
            state.error = actions.payload?.message || "something went wrong";
            state.isAuthenticated = false;
            state.user = null;
        })
        .addCase(logout.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(logout.fulfilled,(state,actions)=>{
            state.loading = false;
            state.isAuthenticated=!!actions.payload;
            state.user = actions.payload;

        })
        .addCase(logout.rejected,(state,actions)=>{
            state.loading = false;
            state.error = actions.payload?.message || "something went wrong";
            state.isAuthenticated = false;
            state.user = null;
        })
    }
}) 

export default authSlice.reducer;