"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect } from "react";

export function Appbar() {
    const session = useSession();
    

        console.log("🖥️ Client - useSession():", session);

    const handleSignIn = () => {
        const result : any =  signIn();
    
        if (result?.error) {
            console.error("Sign-in error:", result.error);
        } else {
            console.log("Sign-in successful, refreshing session...");
            window.location.reload(); // Force a reload to get fresh session
        }
    };

    return <div>
        <div className="flex justify-between items-center px-5 rounded-md bg-white mb-10">
            <h1 className="text-3xl font-bold text-center text-purple-800">MuseList</h1>
            <div>
                {session.data?.user && <button className="m-2 p-2 bg-blue-400 rounded-md" onClick={() => signOut()}>Logout</button>}
                {!session.data?.user && <button className="m-2 p-2 bg-blue-400 rounded-md" onClick={handleSignIn}>SignIn</button>}
            </div>
        </div>

    </div>
}