import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'; 

const signupSchema = z.object({
    firstName : z.string().min(3,"Length should be atleast 3 char"),
    emailId: z.string().email("Invalid email type"),
    password:z.string().min(8,"Password should be atleat 8 char")
})

// error is an object which contain type which failed and message ...for eg
// const errors ={
    //  firstName : {
    //     type : min() ,    type where failed
    //     message : "Length should be atleast 3 char"
    //  },
    //  emailID :undefined ,
    //  password : undefined       emailID and pasword has undefined because this has no errors , if found any error then it will look like firstName
    //                             also undefined means false , that's why we check first if it exist or not
//  }


function Signpage(){
  const { register, handleSubmit, formState: { errors },} = useForm({resolver:zodResolver(signupSchema)});
   
  const submittedData = async(data)=>{
    console.log(data);
  }

  
  return(
        <>
        <form onSubmit={handleSubmit(submittedData)}>
            {/* also this handlesubmit will pass submitted data in object form , so data inside submittedData contain object such as {firstName: 'Kush', email: 'amiourkush41@gmail.com', password: 'jkdslddj'} where whatever you have written inside register is key and what you have given in UI is value , so it store in key - value pair */}
      <input {...register('firstName')} placeholder='Enter Name'/>{errors.firstName && (<span>{errors.firstName.message}</span>)}
       {/* this register will create an object such as {name:firstname ,onChange :,onBlur:} etc , so we have spreaded inside input field. */}
       {/* after input field , JSX is written which means if errors.firstName exist (which means true) and span tag wla is always true , then it will be show error. this double and i.e && means if condition is right ,then it will return the last one and if false then return the first(i.e false wla) for eg console.log(2&&30) ans is 30 and console.log(0&&30) ans is 0 */}
       {/* this can also be written as {errors.firstName ? (<span>{errors.firstName.message}</span>): null } this ternary operator is same as upper && */}
      <input {...register("emailId")} placeholder='Enter Email'/>
      <input {...register("password")} placeholder='Enter password'/>
      <button type='submit' className='btn'>Submit</button>
      </form>

        </>
    )
} 

export default Signpage;