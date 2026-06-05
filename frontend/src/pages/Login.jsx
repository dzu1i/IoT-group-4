import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import greenhouseImage from "../assets/HumiGrow_login.jpg";
import greenhouseDarkImage from "../assets/login_dark.png";

export function Login({ isDark, onLogin }) {
  const imageSrc = isDark ? greenhouseDarkImage : greenhouseImage;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user info");
        const userInfo = await res.json();
        onLogin(userInfo);
      } catch (err) {
        setError("Nepodařilo se přihlásit. Zkus to znovu.");
        setIsLoading(false);
      }
    },
    onError: () => {
      setError("Google přihlášení selhalo. Zkus to znovu.");
      setIsLoading(false);
    },
  });

  return (
    <section className="login-page" aria-labelledby="loginTitle">
      <div className="login-content">
        <div className="login-copy">
          <h1 id="loginTitle">
            Welcome to <span>HumiGrow</span>
          </h1>
          <p>Sign in with your Google account to access your greenhouse dashboard.</p>
        </div>

        <button
          className="google-login-button"
          type="button"
          onClick={() => login()}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.4c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.7-4.9 3.7-8.3Z" />
            <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.8-2.9l-3.7-2.8c-1 .7-2.4 1.1-4.1 1.1-3.1 0-5.7-2.1-6.6-4.9H1.6v2.9C3.5 21.3 7.4 24 12 24Z" />
            <path fill="#FBBC05" d="M5.4 14.5c-.2-.7-.4-1.6-.4-2.5s.1-1.7.4-2.5V6.6H1.6C.6 8.2 0 10.1 0 12s.6 3.8 1.6 5.4l3.8-2.9Z" />
            <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.8 1.2 15.2 0 12 0 7.4 0 3.5 2.7 1.6 6.6l3.8 2.9c.9-2.8 3.5-4.7 6.6-4.7Z" />
          </svg>
          <span>{isLoading ? "Přihlašování…" : "Continue with Google"}</span>
        </button>

        {error && (
          <p className="login-error" role="alert">{error}</p>
        )}

        <div className="login-security">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3 5.5 5.8v5.6c0 4.1 2.6 7.7 6.5 9.1 3.9-1.4 6.5-5 6.5-9.1V5.8L12 3Z" />
            <path d="m9.4 12.1 1.8 1.8 3.6-4" />
          </svg>
          <span>Secure, simple and seamless</span>
        </div>
      </div>

      <img className="greenhouse-image" src={imageSrc} alt="" aria-hidden="true" />

      <footer className="login-footer">© 2026 humigrow. All rights reserved.</footer>
    </section>
  );
}
