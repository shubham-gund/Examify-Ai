"use client"

import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="border-t border-border bg-background"
    >
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary" aria-hidden="true" />
            <span className="font-semibold">Examify AI</span>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-4 text-sm">
              <li>
                <Link to="#features" className="hover:text-primary">
                  Features
                </Link>
              </li>
              <li>
                <Link to="#pricing" className="hover:text-primary">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="#testimonials" className="hover:text-primary">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link to="/login?role=student" className="hover:text-primary">
                  Get Started
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Examify AI. All rights reserved.
        </p>
      </div>
    </motion.footer>
  )
}
