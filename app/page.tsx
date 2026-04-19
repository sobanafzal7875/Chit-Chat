import AuthForm from '@/components/auth/AuthForm';

export default function Home() {
  return (
    <div className="min-h-dvh overflow-y-auto flex flex-col items-center justify-center bg-background relative selection:bg-primary/30">
      {/* Background decorations for a professional/modern look */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="z-10 w-full px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        {/* App Logo / Header Area */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <svg 
              className="w-10 h-10 text-primary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-3 text-foreground">
            Chit<span className="text-primary">Chat</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Connect seamlessly with your team. Built for scalability, real-time chat, and screen sharing.
          </p>
        </div>
        
        {/* Authentication Form Component */}
        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
          <AuthForm />
        </div>
      </div>
      
      {/* Footer Area */}
      <div className="absolute bottom-6 text-center text-sm text-muted-foreground z-10 w-full">
        &copy; {new Date().getFullYear()} ChitChat.
      </div>
    </div>
  );
}
