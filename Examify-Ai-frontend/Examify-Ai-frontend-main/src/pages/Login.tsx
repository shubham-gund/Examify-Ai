import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Mail, Lock, User, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert(isLogin ? "Login successful!" : "Account created!")
    }, 1500)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4 },
    }),
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white to-gray-100">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-100" />

      {/* Subtle animated gradient orbs */}
      <motion.div
        className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gray-300/10 blur-3xl"
        animate={{ y: [0, 30, 0], opacity: [0.2, 0.3, 0.2] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-gray-400/10 blur-3xl"
        animate={{ y: [0, -40, 0], opacity: [0.2, 0.3, 0.2] }}
        transition={{ repeat: Infinity, duration: 7 }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Card */}
          <motion.div
            className="rounded-2xl border border-gray-200 bg-white shadow-xl"
            whileHover={{ boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)" }}
          >
            {/* Header */}
            <div className="border-b border-gray-200 px-8 py-8 text-center">
              <motion.div
                className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-black shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <BookOpen className="h-8 w-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-black">
                MockTest
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {isLogin ? "Welcome back" : "Join us today"}
              </p>
            </div>

            {/* Form */}
            <div className="px-8 py-8">
              {/* Tab Toggle */}
              <div className="mb-8 flex gap-2 rounded-lg bg-gray-100 p-1">
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
                        className="absolute inset-0 rounded-md bg-black"
                        transition={{ type: "spring", duration: 0.3 }}
                      />
                    )}
                    <span className={`relative z-10 ${isLogin === tab.value ? "text-white" : "text-gray-600"}`}>
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Form Fields */}
              <motion.form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <motion.div
                    custom={0}
                    variants={inputVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-black">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 text-black placeholder-gray-500 transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div
                  custom={!isLogin ? 1 : 0}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-black">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 text-black placeholder-gray-500 transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </motion.div>

                <motion.div
                  custom={!isLogin ? 2 : 1}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-black">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 text-black placeholder-gray-500 transition focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </motion.div>

                <motion.button
                  custom={!isLogin ? 3 : 2}
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  type="submit"
                  disabled={loading}
                  className="relative w-full overflow-hidden rounded-lg bg-black py-3 font-semibold text-white transition hover:bg-gray-900 disabled:opacity-70"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <motion.div
                          className="h-4 w-4 rounded-full border-2 border-gray-400 border-t-white"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        {isLogin ? "Sign In" : "Create Account"}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </div>
                </motion.button>
              </motion.form>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center text-sm text-gray-600"
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-black transition hover:text-gray-700 font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </motion.div>
            </div>
          </motion.div>

          {/* Footer Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <Link to={"/"} className="text-sm text-gray-600 transition hover:text-gray-900">
              ← Back to home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}