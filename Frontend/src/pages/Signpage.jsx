import { useForm } from 'react-hook-form';

function Signpage(){
  const { register, handleSubmit, formState: { errors },} = useForm();
   
  const submittedData = async(data)=>{
    console.log(data);
  }
  
  return(
        <>
        <form onSubmit={handleSubmit(submittedData)}>
            {/* also this handlesubmit will pass submitted data in object form , so data inside submittedData contain object such as {firstName: 'Kush', email: 'amiourkush41@gmail.com', password: 'jkdslddj'} where whatever you have written inside register is key and what you have given in UI is value , so it store in key - value pair */}
      <input {...register('firstName')} placeholder='Enter Name'/>
       {/* this register will create an object such as {name:firstname ,onChange :,onBlur:} etc , so we have spreaded inside input field. */}
      <input {...register("email")} placeholder='Enter Email'/>
      <input {...register("password")} placeholder='Enter password'/>
      <button type='submit' className='btn'>Submit</button>
      </form>

        </>
    )
} 

export default Signpage;