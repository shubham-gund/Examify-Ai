"use client"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

export default function AISection() {
  return (
    <motion.section
      id="ai"
      aria-label="AI features"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="border-y border-border bg-muted px-4 py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.06 }}
        >
          <h2 className="text-3xl font-bold md:text-4xl">Generate better assessments with AI</h2>
          <p className="mt-3 text-muted-foreground">
            Examify AI analyzes your syllabus and past questions to produce balanced, difficulty-aware mock tests. Get
            distractor generation, rubric suggestions, and automatic tagging by topic and Bloom’s level.
          </p>
          <ul className="mt-6 grid gap-3 text-sm">
            <li className="rounded-md border border-border bg-background p-3">• Topic coverage and question variety</li>
            <li className="rounded-md border border-border bg-background p-3">
              • Auto-generated solutions and rubrics
            </li>
            <li className="rounded-md border border-border bg-background p-3">
              • Difficulty calibration and analytics
            </li>
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
        >
          <Card className="border-border/60">
            <CardContent className="p-4">
              <img
                src="/ai-generated-exam-sample-with-questions-and-tags.jpg"
                alt="AI-generated exam sample preview"
                className="w-full rounded-md border border-border"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  )
}
