"use client"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Trophy } from "lucide-react"

export default function Features() {
  const items = [
    {
      icon: BookOpen,
      title: "AI-Generated Tests",
      desc: "Upload your syllabus and generate comprehensive mock tests automatically.",
      tone: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Users,
      title: "Built for Everyone",
      desc: "Designed for both students to practice and faculty to assess with confidence.",
      tone: "text-secondary-foreground",
      bg: "bg-secondary",
    },
    {
      icon: Trophy,
      title: "Progress Insights",
      desc: "Instant feedback and analytics to track improvement over time.",
      tone: "text-accent-foreground",
      bg: "bg-accent",
    },
  ]

  return (
    <motion.section
      id="features"
      aria-label="Features"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="px-4 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Why choose Examify AI?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Powerful tools to generate, practice, and evaluate with ease.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map(({ icon: Icon, title, desc, tone, bg }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 * idx, type: "spring", stiffness: 120, damping: 18 }}
              whileHover={{ y: -2, scale: 1.01 }}
              className="will-change-transform"
            >
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <div className={`mb-4 inline-flex rounded-md p-3 ${bg}`}>
                    <Icon className={`h-6 w-6 ${tone}`} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
