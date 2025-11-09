"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

export default function Testimonials() {
  const quotes = [
    {
      name: "Asha R.",
      role: "Computer Science Student",
      text: "Examify AI helped me focus on weak topics. The instant feedback and analytics made revision efficient.",
    },
    {
      name: "Prof. Malik",
      role: "Faculty, Mathematics",
      text: "Question generation and rubrics saved hours. The topic coverage is excellent for formative assessments.",
    },
    {
      name: "Daniel P.",
      role: "Engineering Student",
      text: "The practice sets felt realistic. I improved my scores after just a week of targeted practice.",
    },
  ]

  return (
    <motion.section
      id="testimonials"
      aria-label="Testimonials"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="relative border-t border-border/40 bg-gradient-to-b from-background via-muted/40 to-background px-4 py-20 md:py-28"
    >
      {/* 🔹 Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.05),transparent_70%)] pointer-events-none" />

      <div className="mx-auto max-w-6xl relative">
        <h2 className="text-center text-3xl font-bold md:text-4xl bg-gradient-to-r from-black to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
          Loved by Students and Educators
        </h2>
        <p className="mt-3 text-center text-muted-foreground max-w-2xl mx-auto">
          See what learners and teachers are saying about Examify AI.
        </p>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {quotes.map((q, idx) => (
            <motion.div
              key={q.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.1 * idx,
                type: "spring",
                stiffness: 120,
                damping: 18,
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="will-change-transform h-full"
            >
              <Card
                className="group relative h-full flex flex-col border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* ✨ Gradient Border Glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 blur-xl transition duration-500 pointer-events-none" />

                <CardContent className="relative p-6 flex flex-col flex-1 z-10">
                  <p className="text-pretty text-neutral-700 dark:text-neutral-300 flex-1 italic leading-relaxed">
                    “{q.text}”
                  </p>
                  <div className="mt-6">
                    <div className="font-semibold text-neutral-900 dark:text-white">{q.name}</div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">{q.role}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
