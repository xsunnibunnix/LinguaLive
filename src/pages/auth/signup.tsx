import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SignUpForm from '@/components/signup/SignUpForm';

const RegisterForm: React.FC = () => {
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [emptyField, setEmptyField] = useState(false);
  const [userExists, setUserExists] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const target = e.target as HTMLFormElement;
    const username = target.username.value;
    const email = target.email.value;
    const password = target.password.value;
    const passwordConfirm = target.passwordConfirm.value;

    if (!username || !email || !password) {
      setEmptyField(true);
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordMatch(false);
      return;
    }

    setEmptyField(false);
    setPasswordMatch(true);

    const newUser = {
      username, email, password
    }

    target.username.value = '';
    target.email.value = '';
    target.password.value = '';
    target.passwordConfirm.value = '';
    
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newUser })
    });
    const registeredUser = await response.json();

    if (registeredUser === 'User already exists') {
      setUserExists(true);
      return;
    } else if(response.status !== 400) router.push('/auth/login');
  }

  return (
    <div className="flex flex-col items-center h-full w-full">
      <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-base-content">
        Register for an account
      </h2>
      <p className="text-center mt-1">
        Or <Link href="/auth/login" className="text-secondary font-medium hover:cursor-pointer hover:underline">
          sign in
        </Link> if you already have an account.
      </p>
      <SignUpForm handleSubmit={handleSubmit} passwordMatch={passwordMatch} emptyField={emptyField} />
      <div>
        { userExists &&
          <p className='p-2'>
            Username or Password already exists. <Link href={'/auth/login'} className='text-secondary font-medium hover:cursor-pointer hover:underline'>Click here</Link> to log in.
          </p> }
      </div>
    </div>
  );
};

export default RegisterForm;