// pages/login.js
import { useRouter } from "next/router";
import { Magic } from "magic-sdk";

export default function Login() {
  const router = useRouter();

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const { elements } = event.target;

    //Check if user has an acount
    const isRegistered = await fetch(
      "/api/couchdb/isPatient/" + elements.email.value,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((json) => json.success);

    if (typeof window === "undefined") return;
    const did = await new Magic(
      //@ts-ignore
      process.env.NEXT_PUBLIC_MAGIC_PUB_KEY
    ).auth.loginWithMagicLink({ email: elements.email.value });

    // Once we have the did from magic, login with our own API
    const authRequest = await fetch("/api/magicLink/login", {
      method: "POST",
      headers: { Authorization: `Bearer ${did}` },
    });

    if (authRequest.ok) {
      // Magic Link login successful!
      // Check if email is registered
      if (isRegistered) {
        router.push("/myTrustee/dashboard");
      } else {
        // add account to couchdb
        router.push({
          pathname: "/newPatient",
          query: { email: elements.email.value },
        });
      }
    } else {
      /* handle errors */
    }
  };

  return (
    <div>
      <div>
        <form onSubmit={handleSubmit}>
          <p>Subscribe to your own Trustee or Login with existing account</p>
          <input name="email" type="email" placeholder="Email Address" />
          <button className="btn btn-submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
