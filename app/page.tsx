"use client";

import { CrtBackground } from "@/components/crt/CrtBackground";
import "@/components/threeui.css";
import { useAuth } from "@/hooks/use-auth";
import { signInWithGoogle, auth, db } from "@/lib/firebase";
import { LogOut, LogIn, Trophy } from "lucide-react";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import Image from "next/image";
import { useState } from "react";
import { Leaderboard } from "@/components/Leaderboard";
import { ProfileModal } from "@/components/ProfileModal";
import { User } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleGameOver = async (score: number) => {
    if (!user) return;

    try {
      // 1. Sync to Cloud SQL via API (Zero-Trust Backend)
      const idToken = await user.getIdToken();
      fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ score })
      }).catch(err => console.error("Cloud SQL sync failed:", err));

      // 2. Backup: Save score history to Firestore (as implemented previously)
      await addDoc(collection(db, "scores"), {
        userId: user.uid,
        value: score,
        createdAt: serverTimestamp()
      });

      // 3. Update user high score in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const currentHigh = userSnap.data().highScore || 0;
        if (score > currentHigh) {
          await updateDoc(userRef, {
            highScore: score,
            updatedAt: serverTimestamp()
          });
        }
      } else {
        await setDoc(userRef, {
          displayName: user.displayName,
          photoURL: user.photoURL,
          highScore: score,
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Failed to save score:", err);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <CrtBackground
          variant="nintendo"
          speed={1.00}
          motion={1.00}
          hue={0}
          saturation={1.00}
          brightness={1.00}
          opacity={1.00}
          onGameOver={handleGameOver}
        />
      </div>
      
      {/* Auth & Leaderboard UI Overlay */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
        <button 
          onClick={() => setIsLeaderboardOpen(true)}
          className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-yellow-400 hover:bg-white/10 transition-all hover:scale-110 active:scale-95 shadow-lg"
          title="Leaderboard"
        >
          <Trophy size={20} />
        </button>

        {!loading && (
          user ? (
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 px-4 rounded-full border border-white/10">
              {user.photoURL && (
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                  <Image 
                    src={user.photoURL} 
                    alt={user.displayName || ""} 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <span className="text-white text-sm font-medium hidden sm:inline">{user.displayName}</span>
              <button 
                onClick={() => auth.signOut()}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
              <button 
                onClick={() => setIsProfileOpen(true)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
                title="Secure Profile"
              >
                <User size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-2 bg-white text-black p-2 px-4 rounded-full font-bold hover:bg-white/90 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <LogIn size={18} />
              <span>Login with Google</span>
            </button>
          )
        )}
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        {/* The background itself has the "PUSH START" text in the nintendo variant */}
      </div>

      <Leaderboard isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </main>
  );
}
