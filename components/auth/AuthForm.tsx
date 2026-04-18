'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const body = isLogin
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, username: formData.username, email: formData.email, password: formData.password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(isLogin ? 'Login successful! Redirecting...' : 'Registration successful! You can now login.');
        if (isLogin) {
          // Store token in localStorage or handle login state
          localStorage.setItem('token', data.token);
          if (data.username) {
            localStorage.setItem('username', data.username);
          }
          router.push('/chat');
        } else {
          // Switch to login tab after successful registration
          setTimeout(() => {
            setIsLogin(true);
            setMessage('');
          }, 2000);
        }
      } else {
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-t-4 border-t-primary backdrop-blur-md bg-card/95 transition-all duration-300 hover:shadow-xl shadow-lg relative z-10 overflow-hidden">
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60"></div>
      
      <CardHeader className="space-y-2 pb-6 pt-8">
        <CardTitle className="text-3xl font-extrabold tracking-tight text-center text-foreground">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </CardTitle>
        <CardDescription className="text-center text-base">
          {isLogin 
            ? 'Enter your email and password to sign in' 
            : 'Enter your details below to join the community'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4 transition-all duration-500 ease-in-out">
            {!isLogin && (
              <>
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="transition-all duration-200 focus:scale-[1.01] bg-background"
                  />
                </div>
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="johndoe123"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="transition-all duration-200 focus:scale-[1.01] bg-background"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="transition-all duration-200 focus:scale-[1.01] bg-background"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <a href="#" className="text-sm font-medium text-primary hover:text-primary-hover hover:underline transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="transition-all duration-200 focus:scale-[1.01] bg-background"
              />
            </div>
          </div>
          
          {message && (
            <div className={`p-4 rounded-lg text-sm font-medium border animate-in fade-in slide-in-from-bottom-2 ${
              message.includes('successful') 
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' 
                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
            }`}>
              <div className="flex items-center gap-2">
                {message.includes('successful') ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                {message}
              </div>
            </div>
          )}

          <Button type="submit" className="w-full mt-2 font-semibold text-base py-5 transition-transform active:scale-[0.98]" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4 text-center mt-2 pb-8">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground mt-6">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage('');
              setFormData({ name: '', username: '', email: '', password: '' });
            }}
            className="text-primary hover:text-primary-hover font-semibold hover:underline transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1"
          >
            {isLogin ? 'Sign up now' : 'Sign in instead'}
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
