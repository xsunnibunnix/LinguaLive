import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import type { Session } from "next-auth";
import { User } from 'lucide-react';

type DesktopNavProps = {
  session: Session | null
}

const DesktopNav = ({ session }: DesktopNavProps) => {
  const imageSrc = session?.user.image;
  return (
    <div className="sm:flex hidden">
        {session?.user ? (
          <div className="flex gap-2 md:gap-5">
            <button className="btn btn-outline" onClick={() => signOut()}>Sign Out</button>
          <Link className="flex items-center" href='/profile'>
            {imageSrc ? <Image src={imageSrc}
                width={37}
                height={37}
                className="rounded-full"
                alt="profile"
              /> : <User className="p-1 rounded-full hover:bg-white hover:bg-opacity-20" size={39} />}
            </Link>
          </div>
        ) : (<button onClick={() => signIn()} className="btn btn-primary btn-outline bg-base-100 opacity-80">Sign In</button>)}
      </div>
  )
}

export default DesktopNav