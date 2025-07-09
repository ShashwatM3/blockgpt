'use client'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { doc, setDoc } from "firebase/firestore"; 
import { useState } from "react"
import { db } from "../firebase";
import { useRouter } from "next/navigation"

export function Authentication() {
  const router = useRouter();
  async function createAccount() {
    const el1 = document.getElementById("email");
    const el2 = document.getElementById("password");
    const el3 = document.getElementById("submit-signup");
    if(el1 && el2 && el3) {
      el3.innerHTML="Loading..."
      await setDoc(doc(db, "users", el1.value), {
        email: el1.value,
        password: el2.value,
        root_chats: [],
        tier: "Basic",
        favorites: []
      });
      localStorage.setItem("blockgpt verification", email.value);
      router.push("/Main")
    }
  }

  const [login, setLogin] = useState(true);
  return (
    <>
    <h1 className="text-4xl font-bold mb-10">Authentication</h1>
    {login ? (
      <Card id="logincard" className="dark border-none w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Button onClick={() => {setLogin(false)}} variant="link">Sign Up</Button>
          </CardAction>
        </CardHeader>
        <CardContent className="dark">
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email-login"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password-login" type="password" required />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">
            Login
          </Button>
          {/* <Button variant="outline" className="w-full">
            Login with Google
          </Button> */}
        </CardFooter>
      </Card>
    ):(
      <Card id="logincard" className="dark border-none w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your email below to create an account
          </CardDescription>
          <CardAction>
            <Button onClick={() => {setLogin(true)}} variant="link">Login</Button>
          </CardAction>
        </CardHeader>
        <CardContent className="dark">
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" required />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button onClick={createAccount} type="submit" id="submit-signup" className="w-full">
            Create Account
          </Button>
          {/* <Button variant="outline" className="w-full">
            Login with Google
          </Button> */}
        </CardFooter>
      </Card>
    )}
    </>
  )
}
