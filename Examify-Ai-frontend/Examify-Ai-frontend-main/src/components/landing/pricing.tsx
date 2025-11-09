"use client"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"


export default function Pricing() {
  const plans = [
    {
      name: "Student",
      price: "Free",
      period: "",
      features: ["Unlimited practice sets", "Instant feedback", "Basic analytics"],
      cta: { label: "Start Free", href: "/login?role=student" },
      highlight: false,
    },
    {
      name: "Faculty Pro",
      price: "$12",
      period: "/month",
      features: ["AI test generation", "Rubrics & tagging", "Advanced insights", "Export & share"],
      cta: { label: "Get Pro", href: "/login?role=faculty" },
      highlight: true,
    },
  ]

  return (
    <motion.section
      id="pricing"
      aria-label="Pricing"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="px-4 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Simple, transparent pricing</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Choose a plan that fits your needs. Upgrade anytime.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 * idx, type: "spring", stiffness: 120, damping: 18 }}
              whileHover={{ y: -3, scale: 1.01 }}
              className="will-change-transform"
            >
              <Card
                className={`border-border/60 ${plan.highlight ? "ring-1 ring-primary" : ""}`}
                aria-label={`${plan.name} plan`}
              >
                <CardContent className="p-6">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <div className="text-3xl font-bold">
                      {plan.price}
                      <span className="text-base font-normal text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="mt-4 grid gap-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center">
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-6 w-full">
                    <Link to={plan.cta.href}>{plan.cta.label}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
