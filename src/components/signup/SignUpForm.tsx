type SignUpFormProps = {
  handleSubmit: (e: React.FormEvent) => Promise<void>,
  passwordMatch: Boolean,
  emptyField: Boolean
}

const SignUpForm = ({ handleSubmit, passwordMatch, emptyField }: SignUpFormProps) => {

  return (
    <form onSubmit={ e => handleSubmit(e) } className="flex flex-col items-center space-y-2 w-1/3 pt-4">
      <div className="form-control w-full">
        <label htmlFor="username" className="label font-medium pb-1">
          <span className="label-text">Username</span>
        </label>
        <input type="text" id="username" className="input input-bordered w-full" />
      </div>

      <div className="form-control w-full max-w-md">
        <label htmlFor="email" className="label font-medium pb-1">
          <span className="label-text">Email</span>
        </label>
        <input type="email" id="email" className="input input-bordered w-full" />
      </div>

      <div className="form-control w-full max-w-md">
        <label htmlFor="password" className="label font-medium pb-1">
          <span className="label-text">Password</span>
        </label>
        <input type="password" id="password" className="input input-bordered w-full" />
      </div>

      <div className="form-control w-full max-w-md">
        <label htmlFor="passwordConfirm" className="label font-medium pb-1">
          <span className="label-text">Confirm Password</span>
        </label>
        <input type="password" id="passwordConfirm" className="input input-bordered w-full" />
        { !passwordMatch &&
          <p className='alert alert-error p-1 pl-3 mt-1 text-xs max-w-fit'>Passwords do not match</p>
        }
      </div>

      { emptyField &&
        <div className='alert alert-error max-w-fit text-sm p-1 flex mt-5 self-start'>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 pl-1" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="pr-3">Missing fields</p>
        </div>
      }

      <div className="w-full pt-2">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-5 w-full max-w-md border border-blue-700 rounded"
        >
          Register
        </button>
      </div>
    </form>
  )
}

export default SignUpForm