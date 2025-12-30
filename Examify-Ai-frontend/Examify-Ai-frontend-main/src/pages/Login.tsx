import { useState } from "react"
import { motion } from "framer-motion"
// Added Eye and EyeOff icons
import { BookOpen, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { authService } from "@/lib/api"

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roleFromUrl = searchParams.get('role')
  
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  // New state for password visibility
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [role, setRole] = useState<'student' | 'teacher'>(
    roleFromUrl === 'faculty' ? 'teacher' : 'student'
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }
    setLoading(true)

    try {
      if (isLogin) {
        const response = await authService.login({ email, password })
        toast.success("Login successful!")
        const userRole = response.data.user.role
        navigate(userRole === 'teacher' ? '/faculty' : '/student')
      } else {
        await authService.register({ name, email, password, role })
        toast.success("Account created successfully!")
        navigate(role === 'teacher' ? '/faculty' : '/student')
      }
    } catch (error: any) {
      const message = error.response?.data?.message || (isLogin ? "Login failed" : "Registration failed")
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:50px_50px] opacity-[0.2]" />

      <motion.div
        className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl"
        animate={{ y: [0, 30, 0], opacity: [0.2, 0.3, 0.2] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <motion.div
            className="rounded-2xl border border-border bg-card text-card-foreground shadow-xl"
            whileHover={{ boxShadow: "0 20px 60px rgba(0, 0, 0, 0.05)" }}
          >
            <div className="border-b border-border px-8 py-8 text-center">
              <motion.div
                className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <img 
                  src="/favicon.png" 
                  alt="Examify AI logo" 
                  className="h-16 w-16 rounded-full object-cover"
                />
              </motion.div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Examify AI
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isLogin ? "Welcome back" : "Join us today"}
              </p>
            </div>

            <div className="px-8 py-8">
              <div className="mb-8 flex gap-2 rounded-lg bg-muted p-1">
                {[
                  { label: "Login", value: true },
                  { label: "Sign Up", value: false },
                ].map((tab) => (
                  <button
                    key={String(tab.value)}
                    onClick={() => setIsLogin(tab.value)}
                    className="relative flex-1 py-2 px-4 text-sm font-medium transition-colors"
                  >
                    {isLogin === tab.value && (
                      <motion.div
                        layoutId="active-tab"
                        className="absolute inset-0 rounded-md bg-background shadow-sm"
                        transition={{ type: "spring", duration: 0.3 }}
                      />
                    )}
                    <span className={`relative z-10 ${isLogin === tab.value ? "text-foreground" : "text-muted-foreground"}`}>
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>

              <motion.form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <>
                    <motion.div custom={0} variants={inputVariants} initial="hidden" animate="visible" className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:border-primary outline-none transition"
                          required={!isLogin}
                        />
                      </div>
                    </motion.div>

                    <motion.div custom={1} variants={inputVariants} initial="hidden" animate="visible" className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:ring-1 focus:ring-ring focus:border-primary outline-none transition"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </motion.div>
                  </>
                )}

                <motion.div custom={!isLogin ? 2 : 0} variants={inputVariants} initial="hidden" animate="visible" className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:border-primary outline-none transition"
                      required
                    />
                  </div>
                </motion.div>

                {/* Password Input Section */}
                <motion.div custom={!isLogin ? 3 : 1} variants={inputVariants} initial="hidden" animate="visible" className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      // Dynamic type based on showPassword state
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background pl-10 pr-12 py-3 text-foreground focus:ring-1 focus:ring-ring focus:border-primary outline-none transition"
                      required
                    />
                    {/* Functional Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1} // Prevents tab-key focus for better UX
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </motion.div>

                <motion.button
                  custom={!isLogin ? 4 : 2}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  type="submit"
                  disabled={loading}
                  className="w-full overflow-hidden rounded-lg bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <>
                        {isLogin ? "Sign In" : "Create Account"}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-foreground font-semibold hover:underline transition-all"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
            <Link to={"/"} className="text-sm text-muted-foreground hover:text-foreground transition">
              ← Back to home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}