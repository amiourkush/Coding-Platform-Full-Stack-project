import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'; 
import { useDispatch,useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { loginUser } from '../authSlice';
import { useEffect } from 'react';

const signupSchema = z.object({
    
    emailId: z.string().email("Invalid email type"),
    password:z.string().min(8,"Password should be atleat 8 char")
})

function Loginpage(){
  const dispatch=useDispatch();
   const navigate =useNavigate();

   const {isAuthenticated} = useSelector((state)=>state.auth);
  const { register, handleSubmit, formState: { errors },} = useForm({resolver:zodResolver(signupSchema),
   mode: "onChange",         
 
  });
  useEffect(()=>{
    if(isAuthenticated){
      navigate('/');
    }
  },[isAuthenticated])
   
  const submittedData = async(data)=>{
    dispatch(loginUser(data));
  }

  
  return(
     <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center">Login</h2>

          <form onSubmit={handleSubmit(submittedData)}>
           

            {/* Email */}
            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered"
                {...register("emailId")}
              />
              {errors.emailId && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.emailId.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter password"
                className="input input-bordered"
                {...register("password"
                )}
              />
              {errors.password && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            <button className="btn btn-primary w-full">Login</button>
            <div className='text-center m-1.5'>Don't have account.<a href='/signup' className='text-blue-700'>Signup</a></div>
          </form>
        </div>
      </div>
    </div>
  )
   



} 

export default Loginpage;