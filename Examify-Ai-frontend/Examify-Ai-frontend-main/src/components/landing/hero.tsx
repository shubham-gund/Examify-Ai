"use client"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export default function Hero() {
  return (
    <motion.section
      aria-label="Hero"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="px-4 py-16 md:py-24 border-b border-border bg-gradient-to-b from-background via-muted/40 to-background"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <div>
          <motion.h1
            className="text-balance text-4xl font-bold md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.04 }}
          >
            Master exams with Examify AI
          </motion.h1>
          <motion.p
            className="mt-4 text-muted-foreground text-lg"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
          >
            AI-powered mock tests and instant insights to help students excel and educators craft better assessments.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
          >
            <Button asChild size="lg">
              <Link to="/login?role=student">Start as Student</Link>
            </Button>
            <Button asChild size="lg">
              <Link to="/login?role=faculty">Faculty Portal</Link>
            </Button>
          </motion.div>
          <motion.p
            className="mt-3 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 }}
          >
            No credit card required.
          </motion.p>
        </div>
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          <img
            src="/examify-ai-dashboard-mock-with-charts.jpg"
            alt="Examify AI dashboard preview"
            className="w-full rounded-lg border border-border"
          />

        </motion.div>
      </div>
    </motion.section>
  )
}
