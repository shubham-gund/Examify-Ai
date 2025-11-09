"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function Header() {
  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" aria-label="Examify AI home" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary" aria-hidden="true" />
          <span className="font-semibold">Examify AI</span>
        </Link>

        <nav aria-label="Primary">
          <ul className="hidden items-center gap-6 text-sm md:flex">
            <li><Link to="#features" className="hover:text-primary">Features</Link></li>
            <li><Link to="#ai" className="hover:text-primary">AI</Link></li>
            <li><Link to="#pricing" className="hover:text-primary">Pricing</Link></li>
            <li><Link to="#testimonials" className="hover:text-primary">Testimonials</Link></li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild >
            <Link to="/login?role=faculty">Faculty Portal</Link>
          </Button>
          <Button asChild>
            <Link to="/login?role=student">Start as Student</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  )
}
