import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'; 

const signupSchema = z.object({
    
    emailId: z.string().email("Invalid email type"),
    password:z.string().min(8,"Password should be atleat 8 char")
})

function Loginpage(){
  const { register, handleSubmit, formState: { errors },} = useForm({resolver:zodResolver(signupSchema),
   mode: "onChange",         
 
  });
   
  const submittedData = async(data)=>{
    console.log(data);
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
                {...register("email")}
              />
              {errors.email && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.email.message}
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
          </form>
        </div>
      </div>
    </div>
  )
   



} 

export default Loginpage;