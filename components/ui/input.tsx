import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative group">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#FF781F]/10 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-focus-within:opacity-100" />
          <input
            type={type}
            className={`  flex h-12 w-full rounded-2xl
            border border-white/10
            bg-white/3
            backdrop-blur-xl
            px-4 py-3
            text-sm text-white
            shadow-[0_8px_32px_rgba(0,0,0,0.35)]
            transition-all duration-300

            placeholder:text-white/30

            focus-visible:outline-none
            focus-visible:border-[#FF781F]/60
            focus-visible:bg-white/5
            focus-visible:shadow-[0_0_25px_rgba(255,120,31,0.15)]

            disabled:cursor-not-allowed
            disabled:opacity-50 ${className || ''}`}
            ref={ref}
            {...props}
          />
        </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
